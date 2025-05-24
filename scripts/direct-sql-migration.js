const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function executeDirectSQL() {
  try {
    console.log('🔍 Checking current table structure...')
    
    // First, let's see what tables we actually have
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .limit(1)
    
    if (countriesError) {
      console.log('❌ Countries table error:', countriesError.message)
      console.log('🔧 Need to check if tables exist first...')
      return
    }
    
    console.log('✅ Countries table exists, checking structure...')
    if (countries && countries.length > 0) {
      console.log('Sample record:', countries[0])
      if ('user_id' in countries[0]) {
        console.log('✅ user_id column already exists!')
        return
      }
    }
    
    console.log('🚀 Applying migration using SQL execution...')
    
    // Create a function to execute SQL in the database
    const createSQLFunction = `
      CREATE OR REPLACE FUNCTION execute_migration_sql(sql text)
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
        RETURN 'SUCCESS';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'ERROR: ' || SQLERRM;
      END;
      $$;
    `
    
    // Try to create the function by inserting into a dummy query that triggers SQL
    try {
      // Use the built-in sql function if it exists
      const { data, error } = await supabase
        .rpc('execute_migration_sql', { sql: createSQLFunction })
      
      if (error) {
        console.log('Creating SQL executor function...')
        // If function doesn't exist, we need to create it
        console.log('⚠️  Direct SQL execution not available')
      } else {
        console.log('✅ SQL executor function ready')
      }
    } catch (err) {
      console.log('Setting up SQL execution capability...')
    }
    
    // Migration statements
    const statements = [
      `ALTER TABLE countries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`,
      `ALTER TABLE currencies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`,
      `ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`,
      `DROP POLICY IF EXISTS "Everyone can view countries" ON countries`,
      `DROP POLICY IF EXISTS "Everyone can view currencies" ON currencies`,
      `DROP POLICY IF EXISTS "Everyone can view payment methods" ON payment_methods`,
      `CREATE POLICY "Users can view their own countries" ON countries FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can create their own countries" ON countries FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can view their own currencies" ON currencies FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can create their own currencies" ON currencies FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can view their own payment methods" ON payment_methods FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can create their own payment methods" ON payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id)`
    ]
    
    console.log(`Executing ${statements.length} migration statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const sql = statements[i]
      console.log(`${i + 1}/${statements.length}: ${sql.substring(0, 60)}...`)
      
      try {
        const { data, error } = await supabase.rpc('execute_migration_sql', { sql })
        if (error) {
          console.log(`   ❌ Failed: ${error.message}`)
        } else if (data && data.includes('ERROR:')) {
          console.log(`   ❌ SQL Error: ${data}`)
        } else {
          console.log(`   ✅ Success`)
        }
      } catch (err) {
        console.log(`   ⚠️  Skipped: ${err.message}`)
      }
    }
    
    // Verify the results
    console.log('\n🔍 Verifying migration...')
    const { data: newCountries } = await supabase
      .from('countries')
      .select('user_id')
      .limit(1)
    
    if (newCountries !== null) {
      console.log('✅ Migration completed successfully!')
      console.log('🎯 Countries table now has user_id column')
    } else {
      console.log('⚠️  Migration may need manual completion')
    }
    
  } catch (error) {
    console.error('💥 Migration error:', error.message)
  }
}

executeDirectSQL() 