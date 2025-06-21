const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createWorkingAdminUser() {
  try {
    console.log('👤 Creating Working Admin User...')
    console.log('')

    // Step 1: Create auth user first
    console.log('🔐 Step 1: Creating Auth User...')
    const authResult = await createAuthUser()

    // Step 2: Create user record in users table
    console.log('📝 Step 2: Creating User Record...')
    await createUserRecord(authResult.userId)

    // Step 3: Initialize user limits
    console.log('⚙️  Step 3: Initializing User Limits...')
    await initializeUserLimits(authResult.userId)

    // Step 4: Verify login works
    console.log('✅ Step 4: Verifying Login...')
    await verifyLogin()

    console.log('')
    console.log('🎉 Working Admin User Created Successfully!')
    console.log('')
    console.log('📋 Login Details:')
    console.log('🌐 URL: http://localhost:3001')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 Password: admin123456')
    console.log('👑 Role: Super Admin')
    console.log('')
    console.log('✅ You can now login to your dashboard!')

  } catch (error) {
    console.error('❌ Failed to create admin user:', error)
    process.exit(1)
  }
}

async function createAuthUser() {
  try {
    // First, try to delete any existing admin user to start fresh
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingAdmin = existingUsers.users.find(u => u.email === 'admin@pxvpay.com')
      
      if (existingAdmin) {
        await supabase.auth.admin.deleteUser(existingAdmin.id)
        console.log('  🗑️  Removed existing admin user')
      }
    } catch (err) {
      console.log('  ℹ️  No existing admin user to remove')
    }

    // Create new auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@pxvpay.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: {
        role: 'super_admin',
        name: 'Super Admin'
      }
    })

    if (authError) {
      throw new Error(`Auth user creation failed: ${authError.message}`)
    }

    if (!authUser.user) {
      throw new Error('Auth user creation returned no user data')
    }

    console.log(`  ✅ Auth user created with ID: ${authUser.user.id}`)
    return { userId: authUser.user.id, email: authUser.user.email }

  } catch (error) {
    console.error('  ❌ Auth user creation failed:', error.message)
    throw error
  }
}

async function createUserRecord(userId) {
  try {
    // Delete any existing user record first
    await supabase
      .from('users')
      .delete()
      .eq('email', 'admin@pxvpay.com')

    // Create new user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: 'admin@pxvpay.com',
        role: 'super_admin',
        created_at: new Date().toISOString()
      })

    if (userError) {
      throw new Error(`User record creation failed: ${userError.message}`)
    }

    console.log('  ✅ User record created in users table')

  } catch (error) {
    console.error('  ❌ User record creation failed:', error.message)
    throw error
  }
}

async function initializeUserLimits(userId) {
  try {
    // Delete any existing user limits first
    await supabase
      .from('user_limits')
      .delete()
      .eq('user_id', userId)

    // Create user limits record
    const { error: limitsError } = await supabase
      .from('user_limits')
      .insert({
        user_id: userId,
        user_role: 'super_admin',
        max_checkout_links: null, // Unlimited for super admin
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
      throw new Error(`User limits creation failed: ${limitsError.message}`)
    }

    console.log('  ✅ User limits initialized')

  } catch (error) {
    console.error('  ❌ User limits initialization failed:', error.message)
    throw error
  }
}

async function verifyLogin() {
  try {
    // Test login with the created credentials
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })

    if (loginError) {
      throw new Error(`Login verification failed: ${loginError.message}`)
    }

    if (!loginData.user) {
      throw new Error('Login verification returned no user data')
    }

    // Verify user record exists and has correct role
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', loginData.user.id)
      .single()

    if (userError) {
      throw new Error(`User record verification failed: ${userError.message}`)
    }

    if (userRecord.role !== 'super_admin') {
      throw new Error(`User role verification failed: expected 'super_admin', got '${userRecord.role}'`)
    }

    // Sign out after verification
    await supabase.auth.signOut()

    console.log('  ✅ Login verification successful')
    console.log(`  ✅ User role confirmed: ${userRecord.role}`)

  } catch (error) {
    console.error('  ❌ Login verification failed:', error.message)
    throw error
  }
}

// Run the admin user creation
createWorkingAdminUser() 