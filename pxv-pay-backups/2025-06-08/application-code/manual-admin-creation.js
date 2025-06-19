const { createClient } = require('@supabase/supabase-js')

// Supabase configuration for local development
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminManually() {
  console.log('🔧 Creating Super Admin User Manually...\n')

  try {
    const adminEmail = 'admin@pxvpay.com'
    const adminPassword = 'admin123456'

    console.log('👤 Step 1: Creating admin user via Supabase Admin API...')
    
    // Use the admin API to create the user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'super_admin',
        name: 'Super Admin'
      }
    })

    if (authError) {
      console.log('  ❌ Auth user creation failed:', authError.message)
      
      // Try to list existing users to see if admin already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingAdmin = existingUsers.users.find(user => user.email === adminEmail)
      
      if (existingAdmin) {
        console.log('  ✅ Admin user already exists in auth system')
        console.log('  📧 User ID:', existingAdmin.id)
        
        // Use existing user ID
        const userId = existingAdmin.id
        
        // Create database record
        console.log('\n📝 Step 2: Creating database record for existing auth user...')
        
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: adminEmail,
            role: 'super_admin'
          })
          .select()

        if (userError) {
          console.log('  ❌ Database record creation failed:', userError.message)
        } else {
          console.log('  ✅ Database record created successfully')
        }
        
        // Test login
        console.log('\n🧪 Step 3: Testing login...')
        
        const { data: loginTest, error: loginError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        })

        if (loginError) {
          console.log('  ❌ Login test failed:', loginError.message)
        } else {
          console.log('  ✅ Login test successful!')
          await supabase.auth.signOut()
        }
      } else {
        console.log('  ❌ No existing admin user found')
        return
      }
    } else {
      console.log('  ✅ Auth user created successfully')
      console.log('  📧 User ID:', authUser.user.id)
      console.log('  📧 Email:', authUser.user.email)

      const userId = authUser.user.id

      // Create database record
      console.log('\n📝 Step 2: Creating database record...')
      
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: adminEmail,
          role: 'super_admin'
        })
        .select()

      if (userError) {
        console.log('  ❌ Database record creation failed:', userError.message)
        
        // Try upsert
        const { data: upsertResult, error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: adminEmail,
            role: 'super_admin'
          })
          .select()

        if (upsertError) {
          console.log('  ❌ Database upsert failed:', upsertError.message)
        } else {
          console.log('  ✅ Database record created via upsert')
        }
      } else {
        console.log('  ✅ Database record created successfully')
      }

      // Test login
      console.log('\n🧪 Step 3: Testing login...')
      
      const { data: loginTest, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      })

      if (loginError) {
        console.log('  ❌ Login test failed:', loginError.message)
      } else {
        console.log('  ✅ Login test successful!')
        console.log('  🎫 Access token generated')
        await supabase.auth.signOut()
      }
    }

    // Final verification
    console.log('\n✅ Final Verification...')
    
    // Check auth users
    const { data: allAuthUsers } = await supabase.auth.admin.listUsers()
    const adminAuthUser = allAuthUsers.users.find(user => user.email === adminEmail)
    
    if (adminAuthUser) {
      console.log('  ✅ Auth user exists:', adminAuthUser.email)
      console.log('  🔐 Email confirmed:', adminAuthUser.email_confirmed_at ? 'Yes' : 'No')
    }

    // Check database users
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)

    if (dbError) {
      console.log('  ❌ Database user check failed:', dbError.message)
    } else if (dbUsers && dbUsers.length > 0) {
      console.log('  ✅ Database user exists:', dbUsers[0].email)
      console.log('  👑 Role:', dbUsers[0].role)
    } else {
      console.log('  ⚠️  Database user not found')
    }

    console.log('\n🎉 Super Admin Setup Complete!\n')
    console.log('📋 Login Details:')
    console.log('  📧 Email: admin@pxvpay.com')
    console.log('  🔑 Password: admin123456')
    console.log('  👑 Role: super_admin')
    console.log('\n🌐 Access your app at: http://localhost:3000')
    console.log('🔗 Supabase Studio: http://127.0.0.1:54323')

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the creation
createAdminManually().catch(console.error) 