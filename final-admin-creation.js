const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function finalAdminCreation() {
  try {
    console.log('🎯 Final Admin User Creation...')
    console.log('')

    const adminEmail = 'admin@pxvpay.com'
    const adminPassword = 'admin123456'

    // Step 1: Clean up any existing data
    console.log('🧹 Step 1: Cleaning Up Existing Data...')
    
    // Delete from users table
    await supabase.from('users').delete().eq('email', adminEmail)
    console.log('  ✅ Cleaned users table')

    // Delete from user_limits table
    await supabase.from('user_limits').delete().eq('user_role', 'super_admin')
    console.log('  ✅ Cleaned user_limits table')

    // Step 2: Create auth user using admin API
    console.log('🔐 Step 2: Creating Auth User...')
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'super_admin',
        name: 'Super Admin'
      }
    })

    if (authError) {
      console.log(`  ⚠️  Auth creation warning: ${authError.message}`)
      
      // If auth creation fails, try direct SQL approach
      console.log('  🔧 Trying direct SQL approach...')
      
      const adminUserId = '00000000-0000-0000-0000-000000000001'
      
      const createAuthUserSQL = `
        DELETE FROM auth.users WHERE email = '${adminEmail}';
        INSERT INTO auth.users (
          id,
          instance_id,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at,
          role,
          aud
        ) VALUES (
          '${adminUserId}',
          '00000000-0000-0000-0000-000000000000',
          '${adminEmail}',
          crypt('${adminPassword}', gen_salt('bf')),
          NOW(),
          NOW(),
          NOW(),
          'authenticated',
          'authenticated'
        );
      `

      try {
        await supabase.rpc('exec_sql', { sql: createAuthUserSQL })
        console.log('  ✅ Auth user created via SQL')
        
        // Use the manual ID for subsequent operations
        var finalUserId = adminUserId
      } catch (sqlErr) {
        console.log(`  ❌ SQL creation failed: ${sqlErr.message}`)
        return
      }
    } else {
      console.log(`  ✅ Auth user created via API: ${authUser.user.id}`)
      var finalUserId = authUser.user.id
    }

    // Step 3: Create user record
    console.log('👤 Step 3: Creating User Record...')
    
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: finalUserId,
        email: adminEmail,
        role: 'super_admin',
        created_at: new Date().toISOString()
      })

    if (userError) {
      console.log(`  ❌ User record creation failed: ${userError.message}`)
    } else {
      console.log('  ✅ User record created successfully')
    }

    // Step 4: Create user limits
    console.log('⚙️  Step 4: Creating User Limits...')
    
    const { error: limitsError } = await supabase
      .from('user_limits')
      .insert({
        user_id: finalUserId,
        user_role: 'super_admin',
        max_checkout_links: null, // Unlimited
        current_checkout_links: 0,
        max_monthly_payments: null,
        current_monthly_payments: 0,
        max_storage_mb: null,
        current_storage_mb: 0,
        can_use_analytics: true,
        can_use_webhooks: true,
        can_customize_branding: true,
        can_export_data: true
      })

    if (limitsError) {
      console.log(`  ❌ User limits creation failed: ${limitsError.message}`)
    } else {
      console.log('  ✅ User limits created successfully')
    }

    // Step 5: Verify everything
    console.log('✅ Step 5: Verifying Everything...')
    
    // Check auth users
    const { data: authUsers, error: authListError } = await supabase.auth.admin.listUsers()
    if (authListError) {
      console.log(`  ⚠️  Auth users check warning: ${authListError.message}`)
    } else {
      const adminAuthUser = authUsers.users.find(u => u.email === adminEmail)
      if (adminAuthUser) {
        console.log(`  ✅ Auth user verified: ${adminAuthUser.id}`)
      } else {
        console.log('  ⚠️  Auth user not found in list')
      }
    }

    // Check user record
    const { data: userRecord, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single()

    if (userCheckError) {
      console.log(`  ❌ User record verification failed: ${userCheckError.message}`)
    } else {
      console.log('  ✅ User record verified')
      console.log(`    - ID: ${userRecord.id}`)
      console.log(`    - Email: ${userRecord.email}`)
      console.log(`    - Role: ${userRecord.role}`)
    }

    // Check user limits
    const { data: limitsRecord, error: limitsCheckError } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', finalUserId)
      .single()

    if (limitsCheckError) {
      console.log(`  ❌ User limits verification failed: ${limitsCheckError.message}`)
    } else {
      console.log('  ✅ User limits verified')
      console.log(`    - Max checkout links: ${limitsRecord.max_checkout_links || 'Unlimited'}`)
    }

    // Step 6: Test login
    console.log('🔐 Step 6: Testing Login...')
    
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      })

      if (loginError) {
        console.log(`  ❌ Login test failed: ${loginError.message}`)
      } else {
        console.log('  ✅ Login test successful!')
        console.log(`    - User ID: ${loginData.user.id}`)
        console.log(`    - Email: ${loginData.user.email}`)
        
        // Sign out after test
        await supabase.auth.signOut()
        console.log('  ✅ Signed out after test')
      }
    } catch (err) {
      console.log(`  ❌ Login test error: ${err.message}`)
    }

    console.log('')
    console.log('🎉 Admin User Creation Complete!')
    console.log('')
    console.log('📋 Login Details:')
    console.log('🌐 URL: http://localhost:3001')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 Password: admin123456')
    console.log('👑 Role: Super Admin')
    console.log('')
    console.log('✅ You can now:')
    console.log('1. Start your development server')
    console.log('2. Navigate to the login page')
    console.log('3. Login with the credentials above')
    console.log('4. Access the super admin dashboard')

  } catch (error) {
    console.error('❌ Failed to create admin user:', error)
    process.exit(1)
  }
}

// Run the final creation
finalAdminCreation() 