const { signUpAction } = require('./src/app/actions/auth')

async function testAppSignup() {
  console.log('🧪 Testing Application Signup')
  console.log('=============================')

  try {
    const testEmail = `app-test-${Date.now()}@example.com`
    
    console.log(`Testing signup for: ${testEmail}`)
    
    const result = await signUpAction({
      email: testEmail,
      password: 'testpassword123',
      fullName: 'Test User App'
    })
    
    if (result.success) {
      console.log('✅ Signup successful:', result.message)
      console.log('🎉 USER CREATION IS WORKING!')
      console.log('💡 Users can now sign up in the app!')
      return true
    } else {
      console.log('❌ Signup failed:', result.message)
      return false
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

testAppSignup()
  .then(success => {
    process.exit(success ? 0 : 1)
  }) 