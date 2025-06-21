const { createClient } = require('@supabase/supabase-js')
const { randomUUID } = require('crypto')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function simpleTest() {
  console.log('🧪 Simple User Creation Test')
  console.log('============================')

  try {
    // Test 1: Direct insert to users table
    console.log('\n1️⃣ Testing direct insert to users table...')
    const testUserId = randomUUID()
    const testEmail = `test-${Date.now()}@example.com`
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: testEmail,
        role: 'registered_user',
        active: true
      })
      .select()
    
    if (insertError) {
      console.log('❌ Direct insert failed:', insertError.message)
      return false
    } else {
      console.log('✅ Direct insert successful:', insertData[0])
      
      // Clean up
      await supabase.from('users').delete().eq('id', testUserId)
      console.log('✅ Test record cleaned up')
    }

    // Test 2: Try auth user creation (which should trigger the function)
    console.log('\n2️⃣ Testing auth user creation (trigger test)...')
    const authTestEmail = `auth-test-${Date.now()}@example.com`
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: authTestEmail,
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
    
    console.log('✅ Auth user created:', authData.user.id)
    
    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check if profile was created
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ Profile not created by trigger:', profileError.message)
      
      // Try manual creation
      console.log('   Trying manual profile creation...')
      const { error: manualError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authTestEmail,
          role: 'registered_user',
          active: true
        })
      
      if (manualError) {
        console.log('   ❌ Manual creation failed:', manualError.message)
      } else {
        console.log('   ✅ Manual creation successful')
      }
    } else {
      console.log('✅ Profile created by trigger:', profileData)
    }
    
    // Clean up auth user
    await supabase.auth.admin.deleteUser(authData.user.id)
    console.log('✅ Auth user cleaned up')
    
    console.log('\n🎉 Simple test completed!')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

simpleTest() 