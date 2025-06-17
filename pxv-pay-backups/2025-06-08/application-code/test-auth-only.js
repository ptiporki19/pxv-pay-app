const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthCreation() {
  console.log('🧪 Testing Auth User Creation')
  console.log('=============================')

  try {
    const testEmail = `test-auth-${Date.now()}@example.com`
    
    console.log(`Creating auth user: ${testEmail}`)
    
    // Create auth user - this should trigger our function
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        role: 'registered_user'
      }
    })
    
    if (authError) {
      console.log('❌ Auth user creation failed:', authError.message)
      return false
    }
    
    console.log('✅ Auth user created successfully:', authData.user.id)
    
    // Wait for trigger to fire
    console.log('⏳ Waiting for trigger to create profile...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check if profile was created
    console.log('🔍 Checking if profile was created...')
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ Profile not found:', profileError.message)
      console.log('   This means the trigger didn\'t work or failed')
    } else {
      console.log('✅ Profile created by trigger:', profileData)
      console.log('🎉 TRIGGER IS WORKING!')
    }
    
    // Clean up
    console.log('\n🧹 Cleaning up...')
    await supabase.auth.admin.deleteUser(authData.user.id)
    console.log('✅ Test user cleaned up')
    
    return !profileError
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

testAuthCreation() 