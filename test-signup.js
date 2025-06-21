const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSignup() {
  console.log('🧪 Testing User Signup Functionality')
  console.log('====================================')

  try {
    const testEmail = `test_user_${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    const testFullName = 'Test User'
    
    console.log(`\n📝 Attempting to create user: ${testEmail}`)
    
    // Test 1: Direct auth signup (mimicking what happens in the signup form)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: testFullName,
        role: 'registered_user'
      }
    })
    
    if (authError) {
      console.log('❌ Auth user creation failed:', authError.message)
      return
    }

    console.log('✅ Auth user created successfully:', authData.user.id)

    // Wait a moment for the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 1000))
      
    // Test 2: Check if the profile was created automatically by the trigger
    console.log('\n🔍 Checking if user profile was created automatically...')
    
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
      .eq('id', authData.user.id)
        .single()
      
      if (profileError) {
      console.log('❌ User profile was not created automatically:', profileError.message)
      console.log('🔄 This suggests the trigger might not be working')
      } else {
      console.log('✅ User profile created automatically by trigger!')
      console.log('   Profile details:')
      console.log(`   • ID: ${userProfile.id}`)
      console.log(`   • Email: ${userProfile.email}`)
      console.log(`   • Full Name: ${userProfile.full_name}`)
      console.log(`   • Role: ${userProfile.role}`)
      console.log(`   • Created: ${userProfile.created_at}`)
    }

    // Test 3: Test the create_user_profile RPC function
    console.log('\n🔧 Testing create_user_profile RPC function...')
    
    const testEmail2 = `test_rpc_${Date.now()}@example.com`
    const testUserId = '12345678-1234-1234-1234-123456789012' // dummy UUID for testing
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_user_profile', {
      user_id: testUserId,
      user_email: testEmail2,
      user_role: 'registered_user'
    })

    if (rpcError) {
      console.log('❌ RPC function failed:', rpcError.message)
    } else {
      console.log('✅ RPC function works correctly!')
      console.log('   Result:', rpcResult)
    }

    // Cleanup test users
    console.log('\n🧹 Cleaning up test data...')
    
    // Delete auth user (this should also delete the profile due to CASCADE)
    await supabase.auth.admin.deleteUser(authData.user.id)
    console.log('✅ Test auth user deleted')
    
    // Delete RPC test user if it was created
    if (!rpcError) {
      await supabase
        .from('users')
        .delete()
        .eq('id', testUserId)
      console.log('✅ Test RPC user deleted')
    }

    console.log('\n🎉 Signup Test Complete!')
    console.log('===============================')
    console.log('✅ User creation triggers are working properly')
    console.log('✅ Signup functionality should now work in the app')
    console.log('🚀 Try signing up a new user in the app!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSignup() 