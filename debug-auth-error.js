const { createClient } = require('@supabase/supabase-js')

// Test both client configurations to see which one has issues
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

console.log('🔍 Debugging Auth Error...\n')

async function debugAuthError() {
  try {
    // Test 1: Basic connection test
    console.log('1️⃣ Testing basic Supabase client creation...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('   ✅ Client created successfully')

    // Test 2: Test simple query (should work)
    console.log('2️⃣ Testing simple query...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.log(`   ❌ Simple query failed: ${error.message}`)
    } else {
      console.log('   ✅ Simple query successful')
    }

    // Test 3: Test auth.getSession() - this might trigger the error
    console.log('3️⃣ Testing auth.getSession()...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.log(`   ❌ getSession failed: ${sessionError.message}`)
      console.log(`   📋 Error details:`, sessionError)
    } else {
      console.log('   ✅ getSession successful')
      console.log(`   📋 Session:`, sessionData.session ? 'Active' : 'No session')
    }

    // Test 4: Test auth.getUser() - this might also trigger the error
    console.log('4️⃣ Testing auth.getUser()...')
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.log(`   ❌ getUser failed: ${userError.message}`)
      console.log(`   📋 Error details:`, userError)
    } else {
      console.log('   ✅ getUser successful')
      console.log(`   📋 User:`, userData.user ? userData.user.email : 'No user')
    }

    // Test 5: Test actual login
    console.log('5️⃣ Testing login attempt...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })
    if (loginError) {
      console.log(`   ❌ Login failed: ${loginError.message}`)
      console.log(`   📋 Error details:`, loginError)
    } else {
      console.log('   ✅ Login successful')
      console.log(`   📋 User:`, loginData.user?.email)
    }

    // Test 6: Check auth state after login
    if (!loginError) {
      console.log('6️⃣ Checking auth state after login...')
      const { data: postLoginSession, error: postLoginError } = await supabase.auth.getSession()
      if (postLoginError) {
        console.log(`   ❌ Post-login session check failed: ${postLoginError.message}`)
      } else {
        console.log('   ✅ Post-login session check successful')
        console.log(`   📋 Session:`, postLoginSession.session ? 'Active' : 'No session')
      }
    }

  } catch (error) {
    console.log('💥 Unexpected error:', error)
    console.log('📋 Error stack:', error.stack)
  }
}

// Test connection to Supabase URL first
async function testConnection() {
  console.log('🌐 Testing basic connectivity...')
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`)
    if (response.ok) {
      console.log('   ✅ Basic connectivity working')
    } else {
      console.log(`   ❌ Connectivity issue: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`)
  }
  console.log('')
}

// Run tests
testConnection().then(() => debugAuthError()) 