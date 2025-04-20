
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Use the Supabase client from the integration
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

// Export the client
export const supabase = integrationSupabase;

// Add a simple check to verify the client is working
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase client initialization error:', error);
  } else {
    console.log('Supabase client initialized successfully');
  }
});
