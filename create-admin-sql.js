const { createClient } = require('@supabase/supabase-js')

// Supabase configuration for local development
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminSQL() {
  console.log('🔧 Creating Super Admin User via SQL...\n')

  try {
    const adminEmail = 'admin@pxvpay.com'
    const adminPassword = 'admin123456'
    const adminId = 'a0000000-0000-0000-0000-000000000001' // Fixed UUID for admin

    console.log('🧹 Step 1: Cleaning up existing records...')
    
    // Clean up existing records using direct SQL
    const cleanupSQL = `
      -- Delete from public.users first (foreign key constraint)
      DELETE FROM public.users WHERE email = '${adminEmail}';
      
      -- Delete from auth.users
      DELETE FROM auth.users WHERE email = '${adminEmail}';
      
      SELECT 'Cleanup completed' as result;
    `

    try {
      const { data: cleanupResult, error: cleanupError } = await supabase.rpc('exec_sql', {
        sql: cleanupSQL
      })
      
      if (cleanupError) {
        console.log('  ⚠️  Cleanup warning:', cleanupError.message)
      } else {
        console.log('  ✅ Existing records cleaned up')
      }
    } catch (error) {
      console.log('  ℹ️  No existing records to clean')
    }

    console.log('\n🔐 Step 2: Creating auth user via direct SQL...')
    
    // Create auth user using direct SQL insert
    const createAuthSQL = `
      -- Insert into auth.users table
      INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
      ) VALUES (
        '${adminId}',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        '${adminEmail}',
        crypt('${adminPassword}', gen_salt('bf')),
        NOW(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{"role": "super_admin"}',
        false,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
      );
      
      SELECT 'Auth user created' as result;
    `

    try {
      const { data: authResult, error: authError } = await supabase.rpc('exec_sql', {
        sql: createAuthSQL
      })
      
      if (authError) {
        console.log('  ❌ Auth user creation failed:', authError.message)
        return
      } else {
        console.log('  ✅ Auth user created successfully')
      }
    } catch (error) {
      console.log('  ❌ Auth user creation error:', error.message)
      return
    }

    console.log('\n📝 Step 3: Creating database user record...')
    
    // Create database user record
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: adminId,
        email: adminEmail,
        role: 'super_admin'
      })
      .select()

    if (userError) {
      console.log('  ❌ Database user creation failed:', userError.message)
    } else {
      console.log('  ✅ Database user created successfully')
    }

    console.log('\n🧪 Step 4: Testing login...')
    
    try {
      const { data: loginTest, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      })

      if (loginError) {
        console.log('  ❌ Login test failed:', loginError.message)
      } else {
        console.log('  ✅ Login test successful!')
        console.log('  🎫 Access token generated')
        console.log('  👤 User ID:', loginTest.user.id)
        
        // Sign out after test
        await supabase.auth.signOut()
        console.log('  🚪 Signed out after test')
      }
    } catch (error) {
      console.log('  ❌ Login test error:', error.message)
    }

    console.log('\n✅ Step 5: Final verification...')
    
    // Check auth users
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const adminAuthUser = authUsers.users.find(user => user.email === adminEmail)
    
    if (adminAuthUser) {
      console.log('  ✅ Auth user verified:', adminAuthUser.email)
      console.log('  🔐 Email confirmed:', adminAuthUser.email_confirmed_at ? 'Yes' : 'No')
    } else {
      console.log('  ⚠️  Auth user not found')
    }

    // Check database users
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)

    if (dbError) {
      console.log('  ❌ Database user check failed:', dbError.message)
    } else if (dbUsers && dbUsers.length > 0) {
      console.log('  ✅ Database user verified:', dbUsers[0].email)
      console.log('  👑 Role:', dbUsers[0].role)
    } else {
      console.log('  ⚠️  Database user not found')
    }

    console.log('\n🎉 Super Admin Creation Complete!\n')
    console.log('📋 Login Details:')
    console.log('  📧 Email: admin@pxvpay.com')
    console.log('  🔑 Password: admin123456')
    console.log('  👑 Role: super_admin')
    console.log('  🆔 ID:', adminId)
    console.log('\n🌐 Access your app at: http://localhost:3000')
    console.log('🔗 Supabase Studio: http://127.0.0.1:54323')

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the creation
createAdminSQL().catch(console.error) 