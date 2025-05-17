import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function createUtilisateurTable() {
  try {
    // Read the SQL script
    const sqlScript = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'create_utilisateur_table.sql'),
      'utf8'
    );

    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript });

    if (error) {
      console.error('Error creating utilisateur table:', error);
      return { success: false, error };
    }

    console.log('Utilisateur table created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating utilisateur table:', error);
    return { success: false, error };
  }
}
