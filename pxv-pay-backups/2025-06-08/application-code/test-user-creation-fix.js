const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testUserCreationFix() {
  console.log('🧪 Testing User Creation Fix')
  console.log('===========================')

  try {
    const testEmail = `test_user_fix_${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    console.log(`\n📝 Creating test user: ${testEmail}`)
    
    // Test 1: Create auth user (this should trigger the database user creation)
    console.log('\n1️⃣ Creating auth user...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User Fix',
        role: 'registered_user'
      }
    })
    
    if (authError) {
      console.log('❌ Auth user creation failed:', authError.message)
      return false
    }
    
    console.log('✅ Auth user created successfully:', authUser.user.id)
    
    // Wait for trigger to fire
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Test 2: Check if user profile was created automatically
    console.log('\n2️⃣ Checking if user profile was created automatically...')
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ User profile not found:', profileError.message)
      
      // Test 3: Try manual profile creation using the RPC function
      console.log('\n3️⃣ Trying manual profile creation...')
      const { data: manualProfile, error: manualError } = await supabase.rpc('create_user_profile', {
        user_id: authUser.user.id,
        user_email: testEmail,
        user_role: 'registered_user'
      })
      
      if (manualError) {
        console.log('❌ Manual profile creation failed:', manualError.message)
        return false
      } else {
        console.log('✅ Manual profile creation successful')
      }
    } else {
      console.log('✅ User profile created automatically:')
      console.log(`   • ID: ${userProfile.id}`)
      console.log(`   • Email: ${userProfile.email}`)
      console.log(`   • Role: ${userProfile.role}`)
      console.log(`   • Active: ${userProfile.active}`)
      console.log(`   • Created: ${userProfile.created_at}`)
    }
    
    // Test 4: Test login
    console.log('\n4️⃣ Testing login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message)
    } else {
      console.log('✅ Login successful:', loginData.user.id)
      await supabase.auth.signOut()
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await supabase.auth.admin.deleteUser(authUser.user.id)
    console.log('✅ Test user cleaned up')
    
    console.log('\n🎉 User Creation Fix Test Complete!')
    console.log('==================================')
    
    if (!profileError && !loginError) {
      console.log('✅ ALL TESTS PASSED!')
      console.log('🚀 User creation is now working!')
      console.log('💡 Users can sign up in the app successfully!')
      return true
    } else {
      console.log('⚠️ Some issues remain, but basic auth is working')
      return false
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Run the test
testUserCreationFix()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Test execution failed:', error)
    process.exit(1)
  }) 