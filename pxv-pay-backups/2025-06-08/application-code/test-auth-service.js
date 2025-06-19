const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

const supabaseAnon = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

async function testAuthService() {
  console.log('🔐 Testing Auth Service...\n')
  
  try {
    // 1. Test auth service health
    console.log('1. Testing auth service health...')
    try {
      const { data: session, error: sessionError } = await supabaseAnon.auth.getSession()
      if (sessionError) {
        console.log(`⚠️ Session check warning: ${sessionError.message}`)
      } else {
        console.log(`✅ Auth service responding (session: ${session?.session ? 'active' : 'none'})`)
      }
    } catch (authErr) {
      console.log(`❌ Auth service error: ${authErr.message}`)
    }
    
    // 2. Test user creation with service role
    console.log('\n2. Creating admin user with auth...')
    
    // First, check if user already exists
    const { data: existingUsers } = await supabase.from('users').select('*').eq('email', 'admin@pxvpay.com')
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('✅ Admin user already exists in public.users')
      
      // Check if auth user exists
      try {
        const { data: authUsers, error: authListError } = await supabase.auth.admin.listUsers()
        if (authListError) {
          console.log(`⚠️ Could not list auth users: ${authListError.message}`)
        } else {
          const adminAuthUser = authUsers.users.find(u => u.email === 'admin@pxvpay.com')
          if (adminAuthUser) {
            console.log('✅ Admin user exists in auth.users')
          } else {
            console.log('⚠️ Admin user missing from auth.users, creating...')
            await createAuthUser()
          }
        }
      } catch (err) {
        console.log(`⚠️ Auth user check failed: ${err.message}`)
      }
    } else {
      console.log('Creating new admin user...')
      await createFullAdminUser()
    }
    
    // 3. Test login
    console.log('\n3. Testing login...')
    try {
      const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
        email: 'admin@pxvpay.com',
        password: 'admin123456'
      })
      
      if (loginError) {
        console.log(`❌ Login failed: ${loginError.message}`)
        
        // If login fails, try to create the auth user
        console.log('Attempting to create auth user...')
        await createAuthUser()
      } else {
        console.log(`✅ Login successful: ${loginData.user.email}`)
        
        // Test authenticated API call
        const { data: userData, error: userError } = await supabaseAnon.from('users').select('*').limit(1)
        if (userError) {
          console.log(`❌ Authenticated API call failed: ${userError.message}`)
        } else {
          console.log(`✅ Authenticated API call successful`)
        }
        
        // Sign out
        await supabaseAnon.auth.signOut()
      }
    } catch (loginErr) {
      console.log(`❌ Login test error: ${loginErr.message}`)
    }
    
    console.log('\n🎉 Auth service test completed!')
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.message)
  }
}

async function createAuthUser() {
  try {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@pxvpay.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: { role: 'super_admin' }
    })
    
    if (authError) {
      console.log(`❌ Auth user creation failed: ${authError.message}`)
    } else {
      console.log(`✅ Auth user created: ${authUser.user.email}`)
    }
  } catch (err) {
    console.log(`❌ Auth user creation error: ${err.message}`)
  }
}

async function createFullAdminUser() {
  try {
    // Create auth user first
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@pxvpay.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: { role: 'super_admin' }
    })
    
    if (authError) {
      console.log(`❌ Auth user creation failed: ${authError.message}`)
      return
    }
    
    console.log(`✅ Auth user created: ${authUser.user.email}`)
    
    // Create public user
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: 'admin@pxvpay.com',
        role: 'super_admin'
      })
      .select()
      .single()
    
    if (publicError) {
      console.log(`❌ Public user creation failed: ${publicError.message}`)
    } else {
      console.log(`✅ Public user created`)
    }
    
  } catch (err) {
    console.log(`❌ Full user creation error: ${err.message}`)
  }
}

testAuthService() 