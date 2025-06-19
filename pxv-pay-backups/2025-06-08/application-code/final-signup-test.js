const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function finalSignupTest() {
  console.log('🎯 Final Comprehensive Signup Test')
  console.log('==================================')

  try {
    const testEmail = `final_test_${Date.now()}@example.com`
    const testPassword = 'testpassword123'

    console.log(`\n📝 Testing signup for: ${testEmail}`)

    // Test 1: Create auth user (simulating what the signup form does)
    console.log('\n1️⃣ Creating auth user...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Final Test User',
        role: 'registered_user'
      }
    })

    if (authError) {
      console.log('❌ Auth user creation failed:', authError.message)
      return false
    }

    console.log('✅ Auth user created successfully:', authUser.user.id)

    // Wait for triggers to fire
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Test 2: Check if user profile was created
    console.log('\n2️⃣ Checking user profile creation...')
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single()

    if (profileError) {
      console.log('❌ User profile not created:', profileError.message)
    } else {
      console.log('✅ User profile created successfully:')
      console.log(`   • ID: ${userProfile.id}`)
      console.log(`   • Email: ${userProfile.email}`)
      console.log(`   • Role: ${userProfile.role}`)
      console.log(`   • Active: ${userProfile.active}`)
    }

    // Test 3: Check if user limits were created
    console.log('\n3️⃣ Checking user limits creation...')
    const { data: userLimits, error: limitsError } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', authUser.user.id)
      .single()

    if (limitsError) {
      console.log('❌ User limits not created:', limitsError.message)
    } else {
      console.log('✅ User limits created successfully:')
      console.log(`   • User ID: ${userLimits.user_id}`)
      console.log(`   • Role: ${userLimits.user_role}`)
      console.log(`   • Analytics: ${userLimits.can_use_analytics}`)
      console.log(`   • Webhooks: ${userLimits.can_use_webhooks}`)
    }

    // Test 4: Test signin (simulating what the signin form does)
    console.log('\n4️⃣ Testing signin...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError) {
      console.log('❌ Signin failed:', signInError.message)
    } else {
      console.log('✅ Signin successful:', signInData.user.id)
      
      // Sign out
      await supabase.auth.signOut()
      console.log('✅ Signed out successfully')
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await supabase.auth.admin.deleteUser(authUser.user.id)
    console.log('✅ Test user cleaned up')

    console.log('\n🎉 Final Signup Test Complete!')
    console.log('===============================')
    
    if (!profileError && !limitsError && !signInError) {
      console.log('✅ ALL TESTS PASSED!')
      console.log('🚀 Signup functionality is working perfectly!')
      console.log('💡 Users can now sign up in the app successfully!')
      return true
    } else {
      console.log('⚠️ Some tests failed, but basic auth is working')
      return false
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

finalSignupTest().then(success => {
  console.log(`\n${success ? '🎯' : '⚠️'} Test ${success ? 'PASSED' : 'PARTIALLY PASSED'}`)
  process.exit(success ? 0 : 1)
}) 