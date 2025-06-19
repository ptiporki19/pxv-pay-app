const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

async function createSimpleWorkingAdmin() {
  try {
    console.log('👤 Creating Simple Working Admin User...')
    console.log('')

    const adminEmail = 'admin@pxvpay.com'
    const adminPassword = 'admin123456'

    // Step 1: Create auth user
    console.log('🔐 Step 1: Creating Auth User...')
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'super_admin'
      }
    })

    if (authError) {
      console.log(`  ❌ Auth user creation failed: ${authError.message}`)
      return
    }

    console.log(`  ✅ Auth user created: ${authUser.user.id}`)

    // Step 2: Create user record
    console.log('👤 Step 2: Creating User Record...')
    
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        email: adminEmail,
        role: 'super_admin',
        active: true,
        created_at: new Date().toISOString()
      })

    if (userError) {
      console.log(`  ❌ User record creation failed: ${userError.message}`)
      return
    }

    console.log('  ✅ User record created')

    // Step 3: Test login
    console.log('🔑 Step 3: Testing Login...')
    
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    })

    if (loginError) {
      console.log(`  ❌ Login test failed: ${loginError.message}`)
      return
    }

    console.log('  ✅ Login test successful!')
    console.log(`    - User ID: ${loginData.user.id}`)
    console.log(`    - Email: ${loginData.user.email}`)

    // Step 4: Test user profile fetch
    console.log('📋 Step 4: Testing Profile Fetch...')
    
    const { data: profile, error: profileError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', loginData.user.id)
      .single()

    if (profileError) {
      console.log(`  ❌ Profile fetch failed: ${profileError.message}`)
    } else {
      console.log('  ✅ Profile fetch successful!')
      console.log(`    - Role: ${profile.role}`)
      console.log(`    - Active: ${profile.active}`)
    }

    // Sign out
    await supabaseClient.auth.signOut()
    console.log('  ✅ Signed out successfully')

    console.log('')
    console.log('🎉 Simple Working Admin Created Successfully!')
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

// Run the creation
createSimpleWorkingAdmin() 