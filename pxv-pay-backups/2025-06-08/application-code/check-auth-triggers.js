const { Client } = require('pg')

async function checkAuthTriggers() {
  console.log('🔍 Checking Auth.Users Triggers')
  console.log('===============================')

  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Check all triggers on auth.users
    console.log('\n1️⃣ Checking triggers on auth.users table...')
    const { rows: authTriggers } = await client.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        action_timing,
        action_statement,
        action_orientation
      FROM information_schema.triggers 
      WHERE event_object_table = 'users' 
      AND event_object_schema = 'auth'
      ORDER BY trigger_name;
    `)
    
    console.log(`⚡ Found ${authTriggers.length} triggers on auth.users:`)
    authTriggers.forEach(trigger => {
      console.log(`   • ${trigger.trigger_name}`)
      console.log(`     Event: ${trigger.action_timing} ${trigger.event_manipulation}`)
      console.log(`     Statement: ${trigger.action_statement}`)
      console.log(`     Orientation: ${trigger.action_orientation}`)
      console.log('')
    })

    // Check functions that these triggers call
    console.log('\n2️⃣ Checking function definitions...')
    
    // Get unique function names from triggers
    const functionNames = authTriggers
      .map(t => t.action_statement)
      .filter(s => s.includes('EXECUTE FUNCTION'))
      .map(s => s.match(/EXECUTE FUNCTION ([^(]+)/)?.[1])
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)

    console.log(`🔧 Found ${functionNames.length} trigger functions:`)
    
    for (const funcName of functionNames) {
      try {
        const { rows: funcDef } = await client.query(`
          SELECT 
            routine_name,
            routine_definition
          FROM information_schema.routines 
          WHERE routine_name = $1
          AND routine_schema = 'auth';
        `, [funcName.split('.').pop()])
        
        if (funcDef.length > 0) {
          console.log(`\n📋 Function: ${funcName}`)
          console.log(`Definition preview: ${funcDef[0].routine_definition?.substring(0, 200)}...`)
        }
      } catch (e) {
        console.log(`❌ Could not get definition for ${funcName}:`, e.message)
      }
    }

    // Check if there are any CHECK constraints on auth.users
    console.log('\n3️⃣ Checking constraints on auth.users...')
    const { rows: authConstraints } = await client.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'auth.users'::regclass;
    `)
    
    console.log(`🔐 Found ${authConstraints.length} constraints on auth.users:`)
    authConstraints.forEach(con => {
      const type = {
        'p': 'PRIMARY KEY',
        'f': 'FOREIGN KEY',
        'u': 'UNIQUE',
        'c': 'CHECK'
      }[con.constraint_type] || con.constraint_type
      console.log(`   • ${con.constraint_name}: ${type}`)
      console.log(`     Definition: ${con.constraint_definition}`)
    })

    // Test if we can insert directly into auth.users (bypassing Supabase Auth)
    console.log('\n4️⃣ Testing direct insert into auth.users...')
    
    try {
      const testId = '12345678-1234-1234-1234-123456789012'
      const testEmail = `direct_auth_test_${Date.now()}@example.com`
      
      // First check if we can see the table structure
      const { rows: authColumns } = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'auth'
        ORDER BY ordinal_position;
      `)
      
      console.log('📋 Auth.users table columns:')
      authColumns.forEach(col => {
        console.log(`   • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'} ${col.column_default || ''}`)
      })
      
      // Try minimal insert
      const { rows: directInsert } = await client.query(`
        INSERT INTO auth.users (
          id, 
          email, 
          encrypted_password,
          created_at,
          updated_at,
          aud,
          role
        ) VALUES (
          $1, 
          $2, 
          crypt('testpassword123', gen_salt('bf')),
          NOW(),
          NOW(),
          'authenticated',
          'authenticated'
        )
        RETURNING id, email;
      `, [testId, testEmail])
      
      console.log('✅ Direct auth.users insert successful:', directInsert[0])
      
      // Clean up
      await client.query('DELETE FROM auth.users WHERE id = $1', [testId])
      console.log('🧹 Direct insert cleaned up')
      
    } catch (directError) {
      console.log('❌ Direct auth.users insert failed:', directError.message)
      console.log('   Error code:', directError.code)
      console.log('   Error detail:', directError.detail)
    }

    console.log('\n🎯 Auth Triggers Analysis Complete!')

  } catch (error) {
    console.error('❌ Check failed:', error)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

checkAuthTriggers() 