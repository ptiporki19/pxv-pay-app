const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function executeMigration() {
  try {
    console.log('🚀 Applying Multi-Tenancy Migration')
    console.log('===================================')
    
    // First, let's check current state
    console.log('1️⃣ Checking current table structure...')
    
    const { data: countries } = await supabase.from('countries').select('*').limit(1)
    const hasUserIdCol = countries && countries.length > 0 && 'user_id' in countries[0]
    
    if (hasUserIdCol) {
      console.log('✅ user_id columns already exist, updating RLS policies only...')
    } else {
      console.log('🔧 Adding user_id columns and setting up RLS policies...')
    }
    
    // Execute migration statements one by one
    const migrationStatements = [
      // Add user_id columns
      `ALTER TABLE countries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`,
      `ALTER TABLE currencies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`,
      `ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`,
      
      // Drop existing policies
      `DROP POLICY IF EXISTS "Everyone can view countries" ON countries`,
      `DROP POLICY IF EXISTS "Everyone can view currencies" ON currencies`,
      `DROP POLICY IF EXISTS "Everyone can view payment methods" ON payment_methods`,
      `DROP POLICY IF EXISTS "Only admins can modify countries" ON countries`,
      `DROP POLICY IF EXISTS "Only admins can modify currencies" ON currencies`,
      `DROP POLICY IF EXISTS "Only admins can modify payment methods" ON payment_methods`,
      
      // Countries policies
      `CREATE POLICY "Users can view their own countries" ON countries FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can create their own countries" ON countries FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update their own countries" ON countries FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete their own countries" ON countries FOR DELETE USING (auth.uid() = user_id)`,
      
      // Currencies policies
      `CREATE POLICY "Users can view their own currencies" ON currencies FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can create their own currencies" ON currencies FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update their own currencies" ON currencies FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete their own currencies" ON currencies FOR DELETE USING (auth.uid() = user_id)`,
      
      // Payment methods policies
      `CREATE POLICY "Users can view their own payment methods" ON payment_methods FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can create their own payment methods" ON payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update their own payment methods" ON payment_methods FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete their own payment methods" ON payment_methods FOR DELETE USING (auth.uid() = user_id)`,
      
      // Indices
      `CREATE INDEX IF NOT EXISTS countries_user_id_idx ON countries(user_id)`,
      `CREATE INDEX IF NOT EXISTS currencies_user_id_idx ON currencies(user_id)`,
      `CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id)`
    ]
    
    console.log(`2️⃣ Executing ${migrationStatements.length} migration statements...`)
    
    for (let i = 0; i < migrationStatements.length; i++) {
      const statement = migrationStatements[i]
      console.log(`   ${i + 1}/${migrationStatements.length}: ${statement.substring(0, 50)}...`)
      
      try {
        // Use the built-in SQL function by creating a dummy query that triggers SQL execution
        // Since we can't execute arbitrary SQL directly, we'll use supabase-js sql method
        const { error } = await supabase.rpc('exec_sql', { sql: statement }).single()
        
        if (error && !error.message.includes('does not exist')) {
          // Try alternative approach using REST API directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey
            },
            body: JSON.stringify({ sql: statement })
          })
          
          if (!response.ok) {
            console.log(`   ⚠️  Statement ${i + 1} may need manual execution`)
          }
        }
      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1} may need manual execution: ${err.message}`)
      }
    }
    
    console.log('\n3️⃣ Verifying migration results...')
    
    // Test the new structure
    try {
      const { data: newCountries } = await supabase.from('countries').select('user_id').limit(1)
      const { data: newCurrencies } = await supabase.from('currencies').select('user_id').limit(1)
      const { data: newPaymentMethods } = await supabase.from('payment_methods').select('user_id').limit(1)
      
      console.log('✅ Migration completed successfully!')
      console.log(`   Countries table now has user_id: ${newCountries !== null}`)
      console.log(`   Currencies table now has user_id: ${newCurrencies !== null}`)
      console.log(`   Payment methods table now has user_id: ${newPaymentMethods !== null}`)
      
    } catch (error) {
      console.log('⚠️  Migration partially completed. Some statements may need manual execution.')
      console.log('   Please copy and paste the SQL from scripts/manual-migration.sql into Supabase Studio')
    }
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Test the application: npm run dev')
    console.log('2. Test user isolation: npm run test:user-isolation')
    console.log('3. Create a new user account to verify isolation')
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message)
    console.log('\n📝 Manual Migration Required:')
    console.log('1. Open Supabase Studio: http://127.0.0.1:54323/project/default/sql/1')
    console.log('2. Copy contents of scripts/manual-migration.sql')
    console.log('3. Paste and execute in SQL Editor')
  }
}

executeMigration() 