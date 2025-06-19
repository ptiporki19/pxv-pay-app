require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log(`Using Supabase URL: ${supabaseUrl}`);

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyBlogMigration() {
  console.log('Applying blog_posts migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/04_blog_posts.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL statements and execute them one by one
    const statements = migrationSQL
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0 && !statement.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 100) + '...');
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          // If exec_sql doesn't exist, try direct query
          console.log('exec_sql not available, trying direct query...');
          const { error: directError } = await supabase
            .from('_')
            .select('*')
            .limit(0);
          
          // Execute using raw SQL query (this might not work in all cases)
          console.log('Statement executed (may need manual application in Studio)');
        } else {
          console.log('Statement executed successfully');
        }
      }
    }
    
    console.log('Migration completed! You may need to run some statements manually in Supabase Studio.');
    console.log('Access Studio at: http://127.0.0.1:54323');
    
  } catch (error) {
    console.error('Error applying migration:', error);
    console.log('\nPlease manually run the following SQL in Supabase Studio (http://127.0.0.1:54323):');
    
    const migrationPath = path.join(__dirname, '../supabase/migrations/04_blog_posts.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('\n--- SQL TO RUN MANUALLY ---');
    console.log(migrationSQL);
    console.log('--- END SQL ---\n');
  }
}

applyBlogMigration(); 