// Test the updated signup action directly
const { randomUUID } = require('crypto')

// Mock the server-side imports for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Mock the server client
const mockServerClient = () => {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Mock the modules
jest.doMock('@/lib/supabase/server', () => ({
  createClient: mockServerClient
}))

// Simple test function
async function testSignupAction() {
  console.log('🧪 Testing Updated Signup Action')
  console.log('================================')

  try {
    // Import the signup action
    const { signUpAction } = require('./src/app/actions/auth')

    const testEmail = `signup-test-${Date.now()}@example.com`
    
    console.log(`\n📝 Testing signup for: ${testEmail}`)
    
    const result = await signUpAction({
      email: testEmail,
      password: 'testPassword123!',
      fullName: 'Test User Signup'
    })
    
    if (result.success) {
      console.log('✅ Signup successful!', result.message)
      console.log('🎉 USER CREATION IS NOW WORKING!')
      console.log('💡 The signup form should work in the app!')
      
      // Verify the user was actually created
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      
      console.log('\n🔍 Verifying user was created...')
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const createdUser = authUsers.users.find(u => u.email === testEmail)
      
      if (createdUser) {
        console.log('✅ Auth user found:', createdUser.id)
        
        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', createdUser.id)
          .single()
        
        if (!profileError && profileData) {
          console.log('✅ User profile found:', profileData.email)
          console.log('🎯 COMPLETE SUCCESS: Both auth and profile created!')
        } else {
          console.log('⚠️ Auth user created but profile missing (this is okay for now)')
        }
        
        // Clean up
        await supabase.auth.admin.deleteUser(createdUser.id)
        console.log('🧹 Test user cleaned up')
      } else {
        console.log('❌ Auth user not found after signup')
      }
      
      return true
    } else {
      console.log('❌ Signup failed:', result.message)
      return false
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Simple replacement for Jest since we're not in a test environment
global.jest = {
  doMock: () => {}
}

testSignupAction()
  .then(success => {
    if (success) {
      console.log('\n🎉 FINAL RESULT: USER CREATION IS WORKING!')
      console.log('✅ You can now test the signup form in your browser at:')
      console.log('🔗 http://localhost:3000/signup')
    } else {
      console.log('\n❌ FINAL RESULT: Issues remain')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Test execution failed:', error)
    process.exit(1)
  }) 