const { createClient } = require('@supabase/supabase-js')

console.log('👤 Creating test user and testing RLS policies...')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

const anonClient = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

async function createAndTestUsers() {
  try {
    console.log('\n1️⃣ Creating super admin user...')
    
    // Create super admin using service role
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@pxvpay.com',
      password: 'admin123456',
      email_confirm: true
    })
    
    if (adminError) {
      console.error('❌ Failed to create admin:', adminError.message)
    } else {
      console.log('✅ Admin user created:', adminUser.user.email)
      
      // Update role to super_admin
      const { error: roleError } = await supabase
        .from('users')
        .update({ role: 'super_admin' })
        .eq('id', adminUser.user.id)
      
      if (roleError) {
        console.error('❌ Failed to update admin role:', roleError.message)
      } else {
        console.log('✅ Admin role updated to super_admin')
      }
    }

    console.log('\n2️⃣ Creating regular test user...')
    
    // Create regular user
    const { data: testUser, error: testError } = await supabase.auth.admin.createUser({
      email: 'testuser@example.com',
      password: 'testpass123',
      email_confirm: true
    })
    
    if (testError) {
      console.error('❌ Failed to create test user:', testError.message)
    } else {
      console.log('✅ Test user created:', testUser.user.email)
    }

    console.log('\n3️⃣ Testing RLS policies...')
    
    // Test 1: Service role should see all users
    const { data: serviceUsers, error: serviceError } = await supabase
      .from('users')
      .select('*')
    
    if (serviceError) {
      console.error('❌ Service role fetch failed:', serviceError.message)
    } else {
      console.log(`✅ Service role can see ${serviceUsers.length} users:`)
      serviceUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role})`)
      })
    }

    // Test 2: Super admin should see all users
    console.log('\n4️⃣ Testing super admin access...')
    
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })
    
    if (authError) {
      console.error('❌ Super admin auth failed:', authError.message)
    } else {
      console.log('✅ Super admin authenticated')
      
      const { data: adminUsers, error: adminUsersError } = await anonClient
        .from('users')
        .select('*')
      
      if (adminUsersError) {
        console.error('❌ Super admin fetch failed:', adminUsersError.message)
      } else {
        console.log(`✅ Super admin can see ${adminUsers.length} users:`)
        adminUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.role})`)
        })
      }
    }

    // Test 3: Regular user should only see themselves
    console.log('\n5️⃣ Testing regular user access...')
    
    const { data: testAuthData, error: testAuthError } = await anonClient.auth.signInWithPassword({
      email: 'testuser@example.com',
      password: 'testpass123'
    })
    
    if (testAuthError) {
      console.error('❌ Test user auth failed:', testAuthError.message)
    } else {
      console.log('✅ Test user authenticated')
      
      const { data: testUserUsers, error: testUserUsersError } = await anonClient
        .from('users')
        .select('*')
      
      if (testUserUsersError) {
        console.error('❌ Test user fetch failed:', testUserUsersError.message)
      } else {
        console.log(`✅ Test user can see ${testUserUsers.length} users:`)
        testUserUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.role})`)
        })
      }
    }

  } catch (err) {
    console.error('💥 Test failed:', err)
  }
}

createAndTestUsers().then(() => {
  console.log('\n✅ User creation and RLS test completed!')
  process.exit(0)
}) 