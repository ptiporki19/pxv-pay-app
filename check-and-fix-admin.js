const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndFixAdmin() {
  try {
    console.log('🔍 Checking and Fixing Admin User...')
    console.log('')

    // Step 1: Check what auth users exist
    console.log('🔐 Step 1: Checking Auth Users...')
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log(`  ❌ Auth users check failed: ${authError.message}`)
      return
    }

    console.log(`  ℹ️  Found ${authUsers.users.length} auth users:`)
    authUsers.users.forEach(user => {
      console.log(`    - ${user.email} (ID: ${user.id})`)
    })

    // Find admin user
    const adminAuthUser = authUsers.users.find(u => u.email === 'admin@pxvpay.com')
    
    if (!adminAuthUser) {
      console.log('  ❌ Admin auth user not found')
      return
    }

    console.log(`  ✅ Admin auth user found: ${adminAuthUser.id}`)

    // Step 2: Create user record with correct ID
    console.log('👤 Step 2: Creating User Record with Correct ID...')
    
    // Delete any existing user record first
    await supabase
      .from('users')
      .delete()
      .eq('email', 'admin@pxvpay.com')

    // Create user record with the actual auth user ID
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: adminAuthUser.id, // Use the actual auth user ID
        email: 'admin@pxvpay.com',
        role: 'super_admin',
        created_at: new Date().toISOString()
      })

    if (userError) {
      console.log(`  ❌ User creation failed: ${userError.message}`)
    } else {
      console.log('  ✅ User record created successfully')
    }

    // Step 3: Create user limits
    console.log('⚙️  Step 3: Creating User Limits...')
    
    // Delete any existing user limits first
    await supabase
      .from('user_limits')
      .delete()
      .eq('user_id', adminAuthUser.id)

    // Create user limits
    const { error: limitsError } = await supabase
      .from('user_limits')
      .insert({
        user_id: adminAuthUser.id, // Use the actual auth user ID
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

    // Step 4: Verify everything
    console.log('✅ Step 4: Verifying Complete Setup...')
    
    // Check user record
    const { data: userRecord, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pxvpay.com')
      .single()

    if (userCheckError) {
      console.log(`  ❌ User verification failed: ${userCheckError.message}`)
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
      .eq('user_id', adminAuthUser.id)
      .single()

    if (limitsCheckError) {
      console.log(`  ❌ Limits verification failed: ${limitsCheckError.message}`)
    } else {
      console.log('  ✅ User limits verified')
      console.log(`    - Max checkout links: ${limitsRecord.max_checkout_links || 'Unlimited'}`)
      console.log(`    - Can use analytics: ${limitsRecord.can_use_analytics}`)
    }

    // Step 5: Test login
    console.log('🔐 Step 5: Testing Login...')
    
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@pxvpay.com',
        password: 'admin123456'
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
    console.log('🎉 Admin User Setup Complete!')
    console.log('')
    console.log('📋 Final Login Details:')
    console.log('🌐 URL: http://localhost:3001')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 Password: admin123456')
    console.log('👑 Role: Super Admin')
    console.log('')
    console.log('✅ You can now login to your dashboard!')

  } catch (error) {
    console.error('❌ Failed to check and fix admin:', error)
    process.exit(1)
  }
}

// Run the check and fix
checkAndFixAdmin() 