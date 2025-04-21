
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isTomorrow(dateStr: string) {
  // Returns true if dateStr (ISO) is tomorrow in UTC
  const itemDate = new Date(dateStr);
  const now = new Date();
  now.setUTCHours(0,0,0,0);
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(now.getUTCDate() + 1);
  const itemUTC = new Date(itemDate.getUTCFullYear(), itemDate.getUTCMonth(), itemDate.getUTCDate());
  return itemUTC.getTime() === tomorrow.getTime();
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

  let emailsSent = 0, failures = 0;
  
  // 2. For each user, fetch their products expiring tomorrow
  for (const user of users ?? []) {
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("name, expiry_date")
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (prodError) {
      console.error("Error fetching products for user", user.id, prodError);
      continue;
    }

    const expiringItems = (products ?? []).filter(item => item.expiry_date && isTomorrow(item.expiry_date));
    if (expiringItems.length === 0) continue;

    // Compose HTML table of expiring products
    const itemsList = expiringItems
      .map(
        item => `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;">${item.name}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;">${item.expiry_date}</td></tr>`
      )
      .join("");
    
    const loginUrl = `${SUPABASE_URL.replace(".co", ".co")}/login`; // Replace with your app’s login page URL, edit as needed

    const html = `
      <h2 style="font-family:sans-serif">Hi ${user.username || user.email.split("@")[0]},</h2>
      <p>The following items from your expiry tracker app are expiring <b>tomorrow</b>:</p>
      <table style="border-collapse:collapse;background:#f0fdfa">
        <tr><th style="text-align:left;padding:6px 10px;">Item</th><th style="text-align:left;padding:6px 10px;">Expiry Date</th></tr>
        ${itemsList}
      </table>
      <p style="margin-top:20px">
        <a href="${loginUrl}" style="background:#14b8a6; color:white; padding:8px 20px; border:none; border-radius:4px; text-decoration:none; font-size:16px;">Login to review</a>
      </p>
      <p style="color:#666;font-size:13px;">This is an automated reminder from your expiry tracker app.</p>
    `;

    try {
      await resend.emails.send({
        from: "Expiry Tracker <onboarding@resend.dev>",
        to: [user.email],
        subject: "Reminder: Items expiring tomorrow",
        html,
      });
      emailsSent++;
      console.log("Sent reminder to", user.email);
    } catch (error) {
      console.error("Failed to send reminder to", user.email, error);
      failures++;
    }
  }

  return new Response(
    JSON.stringify({
      message: `Reminders sent: ${emailsSent}, errors: ${failures}`,
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
});
