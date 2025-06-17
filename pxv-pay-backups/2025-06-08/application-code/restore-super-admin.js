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

async function restoreSuperAdmin() {
  console.log('🔧 Restoring Super Admin User in Supabase...\n')

  try {
    // Step 1: Create admin user in auth.users
    console.log('👤 Step 1: Creating Super Admin in Auth System...')
    
    const adminEmail = 'admin@pxvpay.com'
    const adminPassword = 'admin123456'
    
    // First, try to delete existing admin user if exists
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingAdmin = existingUsers.users.find(user => user.email === adminEmail)
      
      if (existingAdmin) {
        console.log('  🗑️  Removing existing admin user...')
        await supabase.auth.admin.deleteUser(existingAdmin.id)
        console.log('  ✅ Existing admin user removed')
      }
    } catch (error) {
      console.log('  ℹ️  No existing admin user found')
    }

    // Create new admin user
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
      console.log('  ⚠️  Auth user creation warning:', authError.message)
    } else {
      console.log('  ✅ Super admin created in auth system:', authUser.user.id)
    }

    // Step 2: Create/Update user record in public.users table
    console.log('\n📝 Step 2: Creating User Record in Database...')
    
    const userId = authUser?.user?.id || '00000000-0000-0000-0000-000000000001' // Fallback ID
    
    // Delete existing user record if exists
    try {
      await supabase
        .from('users')
        .delete()
        .eq('email', adminEmail)
      console.log('  🗑️  Removed existing user record')
    } catch (error) {
      console.log('  ℹ️  No existing user record found')
    }

    // Create new user record
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: adminEmail,
        role: 'super_admin',
        name: 'Super Admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (userError) {
      console.log('  ⚠️  User record warning:', userError.message)
      
      // Try alternative approach - update if exists
      const { data: updateResult, error: updateError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: adminEmail,
          role: 'super_admin',
          name: 'Super Admin',
          updated_at: new Date().toISOString()
        })
        .select()

      if (updateError) {
        console.log('  ⚠️  User upsert warning:', updateError.message)
      } else {
        console.log('  ✅ User record created/updated successfully')
      }
    } else {
      console.log('  ✅ User record created successfully')
    }

    // Step 3: Create user limits record
    console.log('\n🔒 Step 3: Setting Up User Limits...')
    
    // Delete existing user limits if exists
    try {
      await supabase
        .from('user_limits')
        .delete()
        .eq('user_id', userId)
      console.log('  🗑️  Removed existing user limits')
    } catch (error) {
      console.log('  ℹ️  No existing user limits found')
    }

    // Create new user limits (unlimited for super admin)
    const { data: limitsRecord, error: limitsError } = await supabase
      .from('user_limits')
      .insert({
        user_id: userId,
        user_role: 'super_admin',
        max_checkout_links: null, // Unlimited
        max_monthly_payments: null, // Unlimited
        max_storage_mb: null, // Unlimited
        can_use_analytics: true,
        can_use_webhooks: true,
        can_customize_branding: true,
        can_export_data: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (limitsError) {
      console.log('  ⚠️  User limits warning:', limitsError.message)
    } else {
      console.log('  ✅ User limits created successfully')
    }

    // Step 4: Verify super admin setup
    console.log('\n✅ Step 4: Verifying Super Admin Setup...')
    
    // Check auth user
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const adminAuthUser = authUsers.users.find(user => user.email === adminEmail)
    
    if (adminAuthUser) {
      console.log('  ✅ Auth user verified:', adminAuthUser.email)
      console.log('  📧 User ID:', adminAuthUser.id)
      console.log('  🔐 Email confirmed:', adminAuthUser.email_confirmed_at ? 'Yes' : 'No')
    } else {
      console.log('  ⚠️  Auth user not found')
    }

    // Check database user
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)

    if (dbError) {
      console.log('  ⚠️  Database user check error:', dbError.message)
    } else if (dbUsers && dbUsers.length > 0) {
      console.log('  ✅ Database user verified:', dbUsers[0].email)
      console.log('  👑 Role:', dbUsers[0].role)
    } else {
      console.log('  ⚠️  Database user not found')
    }

    // Check user limits
    const { data: userLimits, error: limitsCheckError } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)

    if (limitsCheckError) {
      console.log('  ⚠️  User limits check error:', limitsCheckError.message)
    } else if (userLimits && userLimits.length > 0) {
      console.log('  ✅ User limits verified')
      console.log('  🔓 Checkout links: Unlimited')
      console.log('  🔓 Monthly payments: Unlimited')
      console.log('  🔓 Storage: Unlimited')
    } else {
      console.log('  ⚠️  User limits not found')
    }

    // Step 5: Test login capability
    console.log('\n🧪 Step 5: Testing Login Capability...')
    
    try {
      const { data: loginTest, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      })

      if (loginError) {
        console.log('  ⚠️  Login test warning:', loginError.message)
      } else {
        console.log('  ✅ Login test successful')
        console.log('  🎫 Access token generated')
        
        // Sign out after test
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.log('  ⚠️  Login test error:', error.message)
    }

    console.log('\n🎉 Super Admin Restoration Complete!\n')
    console.log('📋 Super Admin Details:')
    console.log('  📧 Email: admin@pxvpay.com')
    console.log('  🔑 Password: admin123456')
    console.log('  👑 Role: super_admin')
    console.log('  🔓 Permissions: Unlimited access to all features')
    console.log('\n🌐 Login at: http://localhost:3000')
    console.log('🔗 Supabase Studio: http://127.0.0.1:54323')

  } catch (error) {
    console.error('❌ Error during super admin restoration:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the restoration
restoreSuperAdmin().catch(console.error) 