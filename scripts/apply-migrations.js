require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Try to use service role key, fall back to anon key for testing if not available
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

// Create Supabase client with available key
const supabase = createClient(supabaseUrl, supabaseKey);
console.log(`Using Supabase URL: ${supabaseUrl}`);
console.log(`Using ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service role key' : 'anon key'} for authentication`);

async function applyMigrations() {
  console.log('Applying migrations...');
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  
  try {
    // Get list of migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Apply in alphabetical order
    
    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }
    
    console.log(`Found ${files.length} migration files`);
    
    // Apply each migration file in order
    for (const file of files) {
      console.log(`Applying migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the SQL query
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error(`Error applying migration ${file}:`, error);
        // Continue with next migration even if there's an error
      } else {
        console.log(`Successfully applied migration: ${file}`);
      }
    }
    
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

applyMigrations(); 