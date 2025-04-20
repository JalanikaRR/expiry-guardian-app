
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Use the Supabase client from the integration
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

// Export the client
export const supabase = integrationSupabase;
