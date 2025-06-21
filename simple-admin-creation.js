const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function createSimpleAdmin() {
  console.log('👤 Creating Simple Admin User...\n')
  
  try {
    // 1. Check current users table structure
    console.log('1. Checking users table structure...')
    const { data: users, error: usersError } = await supabase.from('users').select('*').limit(1)
    if (usersError) {
      console.log(`❌ Users table error: ${usersError.message}`)
      return
    } else {
      console.log(`✅ Users table accessible`)
    }
    
    // 2. Create admin user with minimal fields
    console.log('\n2. Creating admin user...')
    const userId = '00000000-0000-0000-0000-000000000001'
    
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: 'admin@pxvpay.com',
        role: 'super_admin'
      })
      .select()
      .single()
    
    if (adminError) {
      console.log(`❌ Admin user creation failed: ${adminError.message}`)
    } else {
      console.log(`✅ Admin user created successfully`)
    }
    
    // 3. Verify the user was created
    console.log('\n3. Verifying admin user...')
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pxvpay.com')
      .single()
    
    if (verifyError) {
      console.log(`❌ Verification failed: ${verifyError.message}`)
    } else {
      console.log(`✅ Admin user verified: ${verifyUser.email} (${verifyUser.role})`)
    }
    
    console.log('\n🎉 Admin user creation completed!')
    console.log('\n📋 Admin Details:')
    console.log('- Email: admin@pxvpay.com')
    console.log('- Role: super_admin')
    console.log('- ID: 00000000-0000-0000-0000-000000000001')
    
  } catch (error) {
    console.error('❌ Creation failed:', error.message)
  }
}

createSimpleAdmin() 