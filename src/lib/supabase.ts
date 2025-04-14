
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found. Please connect to Supabase using the integration.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
