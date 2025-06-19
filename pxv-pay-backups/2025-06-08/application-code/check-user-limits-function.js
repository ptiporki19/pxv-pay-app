const { Client } = require('pg')

async function checkUserLimitsFunction() {
  console.log('🔍 Checking initialize_user_limits Function')
  console.log('==========================================')

  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Check if the function exists and get its definition
    console.log('\n1️⃣ Checking initialize_user_limits function...')
    const { rows: funcDef } = await client.query(`
      SELECT routine_definition 
      FROM information_schema.routines 
      WHERE routine_name = 'initialize_user_limits' 
      AND routine_schema = 'public';
    `)
    
    if (funcDef.length > 0) {
      console.log('📋 Function definition:')
      console.log(funcDef[0].routine_definition)
    } else {
      console.log('❌ initialize_user_limits function not found')
    }

    // Check if user_limits table exists
    console.log('\n2️⃣ Checking if user_limits table exists...')
    const { rows: tableCheck } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user_limits' 
      AND table_schema = 'public';
    `)
    
    if (tableCheck.length > 0) {
      console.log('✅ user_limits table exists')
      
      // Check table structure
      const { rows: columns } = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'user_limits' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `)
      
      console.log('📋 user_limits table columns:')
      columns.forEach(col => {
        console.log(`   • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'} ${col.column_default || ''}`)
      })
    } else {
      console.log('❌ user_limits table does not exist')
    }

    // Try to temporarily disable the trigger to test user creation
    console.log('\n3️⃣ Temporarily disabling initialize_user_limits_trigger...')
    await client.query('DROP TRIGGER IF EXISTS initialize_user_limits_trigger ON auth.users;')
    console.log('✅ Trigger disabled')

    // Test user creation with Supabase now
    console.log('\n4️⃣ Testing user creation without the problematic trigger...')
    
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    )

    const testEmail = `test_no_limits_trigger_${Date.now()}@example.com`
    
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'testpassword123',
        email_confirm: true,
        user_metadata: {
          role: 'registered_user'
        }
      })

      if (authError) {
        console.log('❌ Auth user creation still failed:', authError.message)
      } else {
        console.log('✅ Auth user creation successful without limits trigger:', authUser.user.id)
        
        // Cleanup
        await supabase.auth.admin.deleteUser(authUser.user.id)
        console.log('🧹 Test user cleaned up')
      }
    } catch (testError) {
      console.log('❌ Test failed:', testError.message)
    }

    console.log('\n🎯 User Limits Function Analysis Complete!')

  } catch (error) {
    console.error('❌ Check failed:', error)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

checkUserLimitsFunction() 