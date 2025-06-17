const { Client } = require('pg')

async function debugUserCreation() {
  console.log('🔍 Debugging User Creation Issues')
  console.log('=================================')

  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Check users table structure
    console.log('\n1️⃣ Checking users table structure...')
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `)
    
    console.log('📋 Users table columns:')
    columns.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'} ${col.column_default || ''}`)
    })

    // Check constraints
    console.log('\n2️⃣ Checking table constraints...')
    const { rows: constraints } = await client.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        confrelid::regclass as foreign_table
      FROM pg_constraint 
      WHERE conrelid = 'public.users'::regclass;
    `)
    
    console.log('🔐 Table constraints:')
    constraints.forEach(con => {
      const type = {
        'p': 'PRIMARY KEY',
        'f': 'FOREIGN KEY',
        'u': 'UNIQUE',
        'c': 'CHECK'
      }[con.constraint_type] || con.constraint_type
      console.log(`   • ${con.constraint_name}: ${type} ${con.foreign_table || ''}`)
    })

    // Check RLS status
    console.log('\n3️⃣ Checking RLS status...')
    const { rows: rlsStatus } = await client.query(`
      SELECT 
        tablename,
        rowsecurity as rls_enabled,
        relforcerowsecurity as rls_forced
      FROM pg_tables pt
      JOIN pg_class pc ON pt.tablename = pc.relname
      WHERE pt.tablename = 'users' AND pt.schemaname = 'public';
    `)
    
    if (rlsStatus.length > 0) {
      const rls = rlsStatus[0]
      console.log(`🔒 RLS Status: ${rls.rls_enabled ? 'ENABLED' : 'DISABLED'} ${rls.rls_forced ? '(FORCED)' : ''}`)
    }

    // Check RLS policies
    console.log('\n4️⃣ Checking RLS policies...')
    const { rows: policies } = await client.query(`
      SELECT 
        policyname as policy_name,
        cmd as command,
        permissive,
        roles,
        qual as using_expression,
        with_check as with_check_expression
      FROM pg_policies 
      WHERE tablename = 'users' AND schemaname = 'public';
    `)
    
    console.log(`📜 Found ${policies.length} RLS policies:`)
    policies.forEach(policy => {
      console.log(`   • ${policy.policy_name} (${policy.command}): ${policy.permissive}`)
      if (policy.using_expression) {
        console.log(`     Using: ${policy.using_expression}`)
      }
      if (policy.with_check_expression) {
        console.log(`     With Check: ${policy.with_check_expression}`)
      }
    })

    // Try direct insert
    console.log('\n5️⃣ Testing direct user insert...')
    const testUserId = '12345678-1234-1234-1234-123456789012'
    const testEmail = `direct_test_${Date.now()}@example.com`
    
    try {
      const { rows: insertResult } = await client.query(`
        INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, email, role;
      `, [testUserId, testEmail, 'Direct Test User', 'registered_user'])
      
      console.log('✅ Direct insert successful:', insertResult[0])
      
      // Clean up
      await client.query('DELETE FROM public.users WHERE id = $1', [testUserId])
      console.log('🧹 Test record cleaned up')
      
    } catch (insertError) {
      console.log('❌ Direct insert failed:', insertError.message)
      console.log('   Error code:', insertError.code)
      console.log('   Error detail:', insertError.detail)
    }

    // Check for triggers that might be interfering
    console.log('\n6️⃣ Checking all triggers on users table...')
    const { rows: allTriggers } = await client.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        action_timing,
        action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'users' 
      AND event_object_schema = 'public';
    `)
    
    console.log(`⚡ Found ${allTriggers.length} triggers on public.users:`)
    allTriggers.forEach(trigger => {
      console.log(`   • ${trigger.trigger_name} (${trigger.action_timing} ${trigger.event_manipulation})`)
      console.log(`     Statement: ${trigger.action_statement}`)
    })

    // Check auth.users table structure
    console.log('\n7️⃣ Checking auth.users table access...')
    try {
      const { rows: authCheck } = await client.query('SELECT COUNT(*) as count FROM auth.users LIMIT 1')
      console.log(`✅ Auth users table accessible, contains ${authCheck[0].count} users`)
    } catch (authError) {
      console.log('❌ Cannot access auth.users table:', authError.message)
    }

    console.log('\n🎯 Debug Analysis Complete!')

  } catch (error) {
    console.error('❌ Debug failed:', error)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

debugUserCreation() 