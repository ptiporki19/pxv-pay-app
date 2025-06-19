const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAdminLogin() {
  try {
    console.log('🔑 Testing Admin Login...')
    console.log('')

    const adminEmail = 'admin@pxvpay.com'
    const adminPassword = 'admin123456'

    // Test login
    console.log('🔐 Attempting login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    })

    if (loginError) {
      console.log(`  ❌ Login failed: ${loginError.message}`)
      return
    }

    console.log('  ✅ Login successful!')
    console.log(`    - User ID: ${loginData.user.id}`)
    console.log(`    - Email: ${loginData.user.email}`)

    // Test user profile fetch
    console.log('📋 Fetching user profile...')
    const { data: profile, error: profileError } = await supabase
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
      console.log(`    - Created: ${profile.created_at}`)
    }

    // Test basic API calls
    console.log('🌍 Testing basic API calls...')
    
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .limit(5)

    if (countriesError) {
      console.log(`  ⚠️  Countries fetch warning: ${countriesError.message}`)
    } else {
      console.log(`  ✅ Countries fetch successful: ${countries.length} countries`)
    }

    // Sign out
    await supabase.auth.signOut()
    console.log('  ✅ Signed out successfully')

    console.log('')
    console.log('🎉 Admin Login Test Successful!')
    console.log('')
    console.log('📋 Login Details:')
    console.log('🌐 URL: http://localhost:3001')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 Password: admin123456')
    console.log('👑 Role: Super Admin')
    console.log('')
    console.log('✅ You can now login to your dashboard!')

  } catch (error) {
    console.error('❌ Login test failed:', error)
    process.exit(1)
  }
}

// Run the test
testAdminLogin() 