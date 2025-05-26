const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

async function testSignup() {
  console.log('🔐 Testing user signup functionality...')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test signup with new user credentials
    const email = `test${Date.now()}@example.com`
    const password = 'testpassword123'
    const fullName = 'Test User'
    
    console.log(`📧 Attempting signup with: ${email}`)
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: 'registered_user',
        },
      },
    })
    
    if (error) {
      console.error('❌ Signup failed:', error.message)
      console.error('Error details:', error)
      return false
    }
    
    if (data.user) {
      console.log('✅ Signup successful!')
      console.log('👤 User ID:', data.user.id)
      console.log('📧 Email:', data.user.email)
      console.log('🔑 Session exists:', !!data.session)
      
      // Check if user was created in public.users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) {
        console.error('❌ Error checking user profile:', profileError.message)
      } else if (profile) {
        console.log('✅ User profile created in public.users table')
        console.log('👤 Profile:', profile)
      } else {
        console.log('⚠️ User profile not found in public.users table')
      }
      
      return true
    } else {
      console.log('⚠️ No user data returned')
      return false
    }
  } catch (error) {
    console.error('❌ Signup test failed:', error.message)
    return false
  }
}

testSignup().then(success => {
  console.log(`\n${success ? '✅' : '❌'} Signup test ${success ? 'passed' : 'failed'}`)
  process.exit(success ? 0 : 1)
}) 