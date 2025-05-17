// Script to execute SQL using Supabase client
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get SQL file path from command line arguments
const sqlFilePath = process.argv[2];
if (!sqlFilePath) {
  console.error('Error: No SQL file path provided');
  console.log('Usage: node execute-sql.js <path-to-sql-file>');
  process.exit(1);
}

// Read SQL file
const fullPath = path.resolve(process.cwd(), sqlFilePath);
if (!fs.existsSync(fullPath)) {
  console.error(`Error: File not found: ${fullPath}`);
  process.exit(1);
}

const sqlContent = fs.readFileSync(fullPath, 'utf8');

// Execute SQL
async function executeSQL() {
  try {
    console.log(`Executing SQL from ${sqlFilePath}...`);
    
    // Execute the SQL using Supabase's rpc function
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    
    if (error) {
      console.error('Error executing SQL:', error);
      process.exit(1);
    }
    
    console.log('SQL executed successfully!');
    console.log('Result:', data);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

executeSQL();
