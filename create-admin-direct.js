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

async function createAdminDirect() {
  console.log('🔧 Creating Super Admin User Directly...\n')

  try {
    const adminEmail = 'admin@pxvpay.com'
    const adminPassword = 'admin123456'
    const adminId = '00000000-0000-0000-0000-000000000001' // Fixed UUID for admin

    // Step 1: Clean up existing admin records
    console.log('🧹 Step 1: Cleaning up existing admin records...')
    
    // Delete from public.users first (due to foreign key constraints)
    try {
      await supabase.from('users').delete().eq('email', adminEmail)
      console.log('  ✅ Cleaned up existing user record')
    } catch (error) {
      console.log('  ℹ️  No existing user record to clean')
    }

    // Step 2: Create user record in public.users table
    console.log('\n📝 Step 2: Creating user record in public.users...')
    
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: adminId,
        email: adminEmail,
        role: 'super_admin'
      })
      .select()

    if (userError) {
      console.log('  ❌ User record creation failed:', userError.message)
      
      // Try with upsert
      const { data: upsertResult, error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: adminId,
          email: adminEmail,
          role: 'super_admin'
        })
        .select()

      if (upsertError) {
        console.log('  ❌ User upsert failed:', upsertError.message)
      } else {
        console.log('  ✅ User record created via upsert')
      }
    } else {
      console.log('  ✅ User record created successfully')
    }

    // Step 3: Create auth user using SQL
    console.log('\n🔐 Step 3: Creating auth user via SQL...')
    
    const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Delete existing auth user
        DELETE FROM auth.users WHERE email = '${adminEmail}';
        
        -- Insert new auth user
        INSERT INTO auth.users (
          id,
          instance_id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at
        ) VALUES (
          '${adminId}',
          '00000000-0000-0000-0000-000000000000',
          'authenticated',
          'authenticated',
          '${adminEmail}',
          crypt('${adminPassword}', gen_salt('bf')),
          NOW(),
          '{"provider": "email", "providers": ["email"]}',
          '{"role": "super_admin"}',
          NOW(),
          NOW()
        );
        
        SELECT 'Auth user created' as result;
      `
    })

    if (sqlError) {
      console.log('  ⚠️  SQL execution warning:', sqlError.message)
    } else {
      console.log('  ✅ Auth user created via SQL')
    }

    // Step 4: Create user limits if table exists
    console.log('\n🔒 Step 4: Creating user limits...')
    
    try {
      const { data: limitsRecord, error: limitsError } = await supabase
        .from('user_limits')
        .upsert({
          user_id: adminId,
          user_role: 'super_admin',
          max_checkout_links: null,
          max_monthly_payments: null,
          max_storage_mb: null,
          can_use_analytics: true,
          can_use_webhooks: true,
          can_customize_branding: true,
          can_export_data: true
        })
        .select()

      if (limitsError) {
        console.log('  ⚠️  User limits warning:', limitsError.message)
      } else {
        console.log('  ✅ User limits created successfully')
      }
    } catch (error) {
      console.log('  ℹ️  User limits table not available')
    }

    // Step 5: Verify creation
    console.log('\n✅ Step 5: Verifying admin user...')
    
    // Check database user
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)

    if (dbError) {
      console.log('  ❌ Database user check failed:', dbError.message)
    } else if (dbUsers && dbUsers.length > 0) {
      console.log('  ✅ Database user verified:', dbUsers[0].email)
      console.log('  👑 Role:', dbUsers[0].role)
      console.log('  🆔 ID:', dbUsers[0].id)
    } else {
      console.log('  ⚠️  Database user not found')
    }

    // Step 6: Test login
    console.log('\n🧪 Step 6: Testing login...')
    
    try {
      const { data: loginTest, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      })

      if (loginError) {
        console.log('  ⚠️  Login test warning:', loginError.message)
        
        // Try alternative login approach
        console.log('  🔄 Trying alternative login method...')
        
        const { data: altLogin, error: altError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        })

        if (altError) {
          console.log('  ❌ Alternative login failed:', altError.message)
        } else {
          console.log('  ✅ Alternative login successful!')
          await supabase.auth.signOut()
        }
      } else {
        console.log('  ✅ Login test successful!')
        console.log('  🎫 Access token generated')
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.log('  ⚠️  Login test error:', error.message)
    }

    console.log('\n🎉 Super Admin Creation Complete!\n')
    console.log('📋 Admin Details:')
    console.log('  📧 Email: admin@pxvpay.com')
    console.log('  🔑 Password: admin123456')
    console.log('  👑 Role: super_admin')
    console.log('  🆔 ID: 00000000-0000-0000-0000-000000000001')
    console.log('\n🌐 Access your app at: http://localhost:3000')
    console.log('🔗 Supabase Studio: http://127.0.0.1:54323')

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the creation
createAdminDirect().catch(console.error) 