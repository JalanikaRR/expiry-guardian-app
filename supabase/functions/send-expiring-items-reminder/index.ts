
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isTomorrow(dateStr: string) {
  // Better date comparison to handle different date formats
  try {
    const itemDate = new Date(dateStr);
    
    // For debugging
    console.log(`Original date string: ${dateStr}`);
    console.log(`Parsed date: ${itemDate.toISOString()}`);
    
    if (isNaN(itemDate.getTime())) {
      console.error(`Invalid date: ${dateStr}`);
      return false;
    }
    
    const now = new Date();
    
    // Reset hours to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
    
    // For debugging
    console.log(`Today: ${today.toISOString()}`);
    console.log(`Tomorrow: ${tomorrow.toISOString()}`);
    console.log(`Item date: ${itemDateOnly.toISOString()}`);
    console.log(`Is tomorrow: ${itemDateOnly.getTime() === tomorrow.getTime()}`);
    
    return itemDateOnly.getTime() === tomorrow.getTime();
  } catch (error) {
    console.error(`Error parsing date ${dateStr}:`, error);
    return false;
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (e) {
    return dateStr;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Setup Supabase client dynamically using environment for secret keys
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response("Missing Supabase environment variables", { status: 500, headers: corsHeaders });
  }
  const { createClient } = await import("npm:@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. Fetch all users
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, email, username");
  if (usersError) {
    console.error("Error fetching users", usersError);
    return new Response("Failed to fetch users", { status: 500, headers: corsHeaders });
  }

  console.log(`Found ${users?.length || 0} users`);
  
  // For testing/debugging - include details of which users have expiring products
  const userSummary: Record<string, any> = {};
  let emailsSent = 0, failures = 0;
  
  // 2. For each user, fetch their products expiring tomorrow
  for (const user of users ?? []) {
    console.log(`Processing user: ${user.username || user.email}`);
    
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, name, expiry_date")
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (prodError) {
      console.error(`Error fetching products for user ${user.id}`, prodError);
      userSummary[user.email] = { error: prodError.message };
      failures++;
      continue;
    }

    console.log(`User ${user.email} has ${products?.length || 0} products`);
    
    // Log all products for debugging
    if (products && products.length > 0) {
      console.log(`Products for ${user.email}:`, 
        products.map(p => ({ id: p.id, name: p.name, expiry: p.expiry_date })));
    }

    const expiringItems = (products ?? []).filter(item => {
      const isExpiring = item.expiry_date && isTomorrow(item.expiry_date);
      console.log(`Product ${item.name} expiring: ${isExpiring}, date: ${item.expiry_date}`);
      return isExpiring;
    });
    
    userSummary[user.email] = {
      totalProducts: products?.length || 0,
      expiringItems: expiringItems.length,
      expiringProducts: expiringItems.map(i => i.name)
    };

    if (expiringItems.length === 0) {
      console.log(`No expiring items for user ${user.email}`);
      continue;
    }

    console.log(`Found ${expiringItems.length} expiring items for user ${user.email}`);

    // Compose HTML table of expiring products
    const itemsList = expiringItems
      .map(
        item => `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${formatDate(item.expiry_date)}</td>
        </tr>`
      )
      .join("");
    
    // Use the deployed URL or a localhost fallback
    const baseUrl = SUPABASE_URL.replace(".supabase.co", "").replace("https://", "");
    const loginUrl = `https://${baseUrl}.vercel.app/login`;

    const html = `
      <h2 style="font-family:sans-serif">Hi ${user.username || user.email.split("@")[0]},</h2>
      <p>The following items from your expiry tracker app are expiring <b>tomorrow</b>:</p>
      <table style="border-collapse:collapse;background:#f0fdfa">
        <tr>
          <th style="text-align:left;padding:6px 10px;">Item</th>
          <th style="text-align:left;padding:6px 10px;">Expiry Date</th>
        </tr>
        ${itemsList}
      </table>
      <p style="margin-top:20px">
        <a href="${loginUrl}" style="background:#14b8a6; color:white; padding:8px 20px; border:none; border-radius:4px; text-decoration:none; font-size:16px;">Login to review</a>
      </p>
      <p style="color:#666;font-size:13px;">This is an automated reminder from your expiry tracker app.</p>
    `;

    try {
      const emailResponse = await resend.emails.send({
        from: "Expiry Tracker <onboarding@resend.dev>",
        to: [user.email],
        subject: "Reminder: Items expiring tomorrow",
        html,
      });
      emailsSent++;
      console.log("Sent reminder to", user.email, emailResponse);
    } catch (error) {
      console.error("Failed to send reminder to", user.email, error);
      failures++;
    }
  }

  return new Response(
    JSON.stringify({
      message: `Reminders sent: ${emailsSent}, errors: ${failures}`,
      details: userSummary
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
});

