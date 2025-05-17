import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});

// Helper function to check if a table exists
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    // Try to get the count of rows from the table
    // If the table doesn't exist, this will return an error
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    // If there's an error, check if it's because the table doesn't exist
    if (error) {
      console.warn(`Error checking table ${tableName}:`, error.message);

      // If the error message contains 'does not exist', the table doesn't exist
      if (error.message && error.message.includes('does not exist')) {
        return false;
      }

      // For other types of errors, we'll assume the table might exist
      // but we don't have permission to access it
      return true;
    }

    // If there's no error, the table exists
    return true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    // For unexpected errors, we'll assume the table might exist
    return true;
  }
}
