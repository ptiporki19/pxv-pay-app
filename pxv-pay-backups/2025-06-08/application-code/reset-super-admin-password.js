const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function resetSuperAdminPassword() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('🔑 RESETTING SUPER ADMIN PASSWORD...\n')
  
  try {
    // Get the super admin user ID
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pxvpay.com')
      .single()
    
    if (!users) {
      console.log('❌ Super admin user not found in users table')
      return
    }
    
    console.log('✅ Found super admin user:', users.email)
    console.log('📋 User ID:', users.id)
    console.log('📋 Role:', users.role)
    
    // Reset password using admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      users.id,
      { 
        password: 'SuperAdmin123!',
        email_confirm: true
      }
    )
    
    if (error) {
      console.log('❌ Password reset failed:', error.message)
      return
    }
    
    console.log('✅ Password reset successful!')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 New Password: SuperAdmin123!')
    
    // Test the new password
    console.log('\n🧪 TESTING NEW PASSWORD...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'SuperAdmin123!'
    })
    
    if (signInError) {
      console.log('❌ Login test failed:', signInError.message)
    } else {
      console.log('✅ Login test successful!')
      console.log('📋 Authenticated user:', signInData.user.email)
      
      // Sign out
      await supabase.auth.signOut()
      console.log('✅ Signed out successfully')
    }
    
  } catch (err) {
    console.error('💥 Error:', err.message)
  }
}

resetSuperAdminPassword().catch(console.error) 