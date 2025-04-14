
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock Supabase client when credentials are missing
// This allows the app to load without crashing, but functionality will be limited
let supabase;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found. Please connect to Supabase using the integration.');
  
  // Create a mock client that doesn't throw errors but returns empty results
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) })
    })
  };
} else {
  // Create the real Supabase client when credentials are available
  supabase = createClient<Database>(supabaseUrl, supabaseKey);
}

export { supabase };
