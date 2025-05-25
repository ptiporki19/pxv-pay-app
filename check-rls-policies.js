const { createClient } = require('@supabase/supabase-js')

console.log('🔍 Checking current RLS policies on users table...')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function checkRLSPolicies() {
  try {
    console.log('\n📋 Querying pg_policies for users table...')
    
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users')
    
    if (error) {
      console.error('❌ Failed to fetch policies:', error.message)
    } else {
      console.log(`✅ Found ${policies.length} policies on users table:`)
      policies.forEach((policy, index) => {
        console.log(`\n${index + 1}. Policy: "${policy.policyname}"`)
        console.log(`   Command: ${policy.cmd}`)
        console.log(`   Roles: ${policy.roles}`)
        console.log(`   Using: ${policy.qual}`)
        console.log(`   With Check: ${policy.with_check}`)
      })
    }

    console.log('\n🔧 Attempting to fix RLS policies manually...')
    
    // Try to drop all policies first
    const dropCommands = [
      'DROP POLICY IF EXISTS "Users can view own profile" ON public.users',
      'DROP POLICY IF EXISTS "Super admins can view all users" ON public.users',
      'DROP POLICY IF EXISTS "Super admins can update all users" ON public.users',
      'DROP POLICY IF EXISTS "users_select_policy" ON public.users',
      'DROP POLICY IF EXISTS "users_update_policy" ON public.users',
      'DROP POLICY IF EXISTS "users_insert_policy" ON public.users'
    ]
    
    for (const cmd of dropCommands) {
      console.log(`Executing: ${cmd}`)
      try {
        // Use raw SQL execution through a simple query
        const { error } = await supabase.rpc('sql', { query: cmd })
        if (error) {
          console.log(`⚠️  ${error.message}`)
        } else {
          console.log('✅ Executed successfully')
        }
      } catch (err) {
        console.log(`⚠️  ${err.message}`)
      }
    }

    // Create new simple policies
    const createCommands = [
      `CREATE POLICY "users_select_policy" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id OR auth.email() = 'admin@pxvpay.com')`,
      `CREATE POLICY "users_update_policy" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id OR auth.email() = 'admin@pxvpay.com') WITH CHECK (auth.uid() = id OR auth.email() = 'admin@pxvpay.com')`,
      `CREATE POLICY "users_insert_policy" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id)`
    ]
    
    for (const cmd of createCommands) {
      console.log(`\nExecuting: ${cmd.substring(0, 80)}...`)
      try {
        const { error } = await supabase.rpc('sql', { query: cmd })
        if (error) {
          console.log(`❌ ${error.message}`)
        } else {
          console.log('✅ Created successfully')
        }
      } catch (err) {
        console.log(`❌ ${err.message}`)
      }
    }

  } catch (err) {
    console.error('💥 Check failed:', err)
  }
}

checkRLSPolicies().then(() => {
  console.log('\n✅ RLS policy check completed!')
  process.exit(0)
}) 