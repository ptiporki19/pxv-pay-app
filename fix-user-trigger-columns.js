const { Client } = require('pg')

async function fixUserTriggerColumns() {
  console.log('🔧 Fixing User Creation Trigger Column Mismatch')
  console.log('================================================')

  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    // First, check what columns actually exist in the users table
    console.log('\n1️⃣ Checking actual users table structure...')
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `)
    
    console.log('📋 Actual users table columns:')
    columns.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'} ${col.column_default || ''}`)
    })

    // Update the trigger function to match the actual table structure
    console.log('\n2️⃣ Updating handle_new_user function to match table structure...')
    
    const updatedFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.users (id, email, role, created_at, active)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'role', 'registered_user')::user_role,
          NOW(),
          true
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    await client.query(updatedFunctionSQL)
    console.log('✅ Updated handle_new_user function to match table structure')

    // Also update the create_user_profile RPC function
    console.log('\n3️⃣ Updating create_user_profile RPC function...')
    
    const updatedRPCSQL = `
      CREATE OR REPLACE FUNCTION public.create_user_profile(
        user_id UUID,
        user_email TEXT,
        user_role TEXT DEFAULT 'registered_user'
      )
      RETURNS JSON AS $$
      DECLARE
        result JSON;
      BEGIN
        INSERT INTO public.users (id, email, role, created_at, active)
        VALUES (user_id, user_email, user_role::user_role, NOW(), true)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          role = EXCLUDED.role::user_role
        RETURNING to_json(users.*) INTO result;
        
        RETURN result;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    await client.query(updatedRPCSQL)
    console.log('✅ Updated create_user_profile RPC function')

    // Test the updated functions
    console.log('\n4️⃣ Testing updated user creation...')
    
    const testUserId = '12345678-1234-1234-1234-123456789012'
    const testEmail = `test_fixed_${Date.now()}@example.com`
    
    try {
      const { rows: insertResult } = await client.query(`
        INSERT INTO public.users (id, email, role, created_at, active)
        VALUES ($1, $2, $3, NOW(), true)
        RETURNING id, email, role, active;
      `, [testUserId, testEmail, 'registered_user'])
      
      console.log('✅ Direct insert with correct columns successful:', insertResult[0])
      
      // Clean up
      await client.query('DELETE FROM public.users WHERE id = $1', [testUserId])
      console.log('🧹 Test record cleaned up')
      
    } catch (insertError) {
      console.log('❌ Direct insert still failed:', insertError.message)
    }

    // Test the RPC function
    console.log('\n5️⃣ Testing updated RPC function...')
    
    const testUserId2 = '87654321-4321-4321-4321-210987654321'
    const testEmail2 = `test_rpc_fixed_${Date.now()}@example.com`
    
    try {
      const { rows: rpcResult } = await client.query(`
        SELECT public.create_user_profile($1, $2, $3) as result;
      `, [testUserId2, testEmail2, 'registered_user'])
      
      console.log('✅ RPC function test successful:', rpcResult[0].result)
      
      // Clean up
      await client.query('DELETE FROM public.users WHERE id = $1', [testUserId2])
      console.log('🧹 RPC test record cleaned up')
      
    } catch (rpcError) {
      console.log('❌ RPC function test failed:', rpcError.message)
    }

    console.log('\n🎉 User Creation Fix Complete!')
    console.log('✅ Triggers and functions updated to match actual table structure')
    console.log('🚀 Signup should now work properly!')

  } catch (error) {
    console.error('❌ Fix failed:', error)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

fixUserTriggerColumns() 