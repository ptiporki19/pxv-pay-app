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

async function createSuperAdmin() {
  console.log('🔧 Creating Super Admin User...\n')

  try {
    const adminEmail = 'admin@pxvpay.com'
    const adminPassword = 'admin123456'

    // Step 1: Check current database schema
    console.log('📊 Step 1: Checking Database Schema...')
    
    // Check users table structure
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) {
      console.log('  ⚠️  Users table error:', usersError.message)
    } else {
      console.log('  ✅ Users table accessible')
    }

    // Step 2: Create admin user in Supabase Auth
    console.log('\n👤 Step 2: Creating Admin in Supabase Auth...')
    
    // First, try to delete existing admin user
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingAdmin = existingUsers.users.find(user => user.email === adminEmail)
      
      if (existingAdmin) {
        console.log('  🗑️  Removing existing admin user...')
        await supabase.auth.admin.deleteUser(existingAdmin.id)
        console.log('  ✅ Existing admin user removed')
      }
    } catch (error) {
      console.log('  ℹ️  No existing admin user to remove')
    }

    // Create new admin user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'super_admin'
      }
    })

    if (authError) {
      console.log('  ❌ Auth user creation failed:', authError.message)
      return
    }

    console.log('  ✅ Super admin created in auth system')
    console.log('  📧 User ID:', authUser.user.id)
    console.log('  📧 Email:', authUser.user.email)

    // Step 3: Create user record in database (using only existing columns)
    console.log('\n📝 Step 3: Creating Database User Record...')
    
    const userId = authUser.user.id

    // Delete existing user record if exists
    try {
      await supabase
        .from('users')
        .delete()
        .eq('id', userId)
      console.log('  🗑️  Removed existing user record')
    } catch (error) {
      console.log('  ℹ️  No existing user record to remove')
    }

    // Create new user record with minimal required fields
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: adminEmail,
        role: 'super_admin'
      })
      .select()

    if (userError) {
      console.log('  ⚠️  User record warning:', userError.message)
      
      // Try with even simpler approach
      const { data: simpleUser, error: simpleError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: adminEmail,
          role: 'super_admin'
        }, {
          onConflict: 'id'
        })
        .select()

      if (simpleError) {
        console.log('  ❌ Simple user creation failed:', simpleError.message)
      } else {
        console.log('  ✅ User record created successfully')
      }
    } else {
      console.log('  ✅ User record created successfully')
    }

    // Step 4: Test login
    console.log('\n🧪 Step 4: Testing Login...')
    
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
        
        // Sign out after test
        await supabase.auth.signOut()
        console.log('  🚪 Signed out after test')
      }
    } catch (error) {
      console.log('  ❌ Login test error:', error.message)
    }

    // Step 5: Verify everything
    console.log('\n✅ Step 5: Final Verification...')
    
    // Check auth users
    const { data: allAuthUsers } = await supabase.auth.admin.listUsers()
    const adminAuthUser = allAuthUsers.users.find(user => user.email === adminEmail)
    
    if (adminAuthUser) {
      console.log('  ✅ Auth user exists:', adminAuthUser.email)
      console.log('  🔐 Email confirmed:', adminAuthUser.email_confirmed_at ? 'Yes' : 'No')
      console.log('  📅 Created:', new Date(adminAuthUser.created_at).toLocaleString())
    }

    // Check database users
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)

    if (dbError) {
      console.log('  ❌ Database user check failed:', dbError.message)
    } else if (dbUsers && dbUsers.length > 0) {
      console.log('  ✅ Database user exists:', dbUsers[0].email)
      console.log('  👑 Role:', dbUsers[0].role)
    } else {
      console.log('  ⚠️  Database user not found')
    }

    console.log('\n🎉 Super Admin Creation Complete!\n')
    console.log('📋 Login Details:')
    console.log('  📧 Email: admin@pxvpay.com')
    console.log('  🔑 Password: admin123456')
    console.log('  👑 Role: super_admin')
    console.log('\n🌐 Access your app at: http://localhost:3000')
    console.log('🔗 Supabase Studio: http://127.0.0.1:54323')

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the creation
createSuperAdmin().catch(console.error) 