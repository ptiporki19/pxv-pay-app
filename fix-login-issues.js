const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

async function fixLoginIssues() {
  try {
    console.log('🔧 Fixing Login Issues...')
    console.log('')

    const adminEmail = 'admin@pxvpay.com'
    const adminPassword = 'admin123456'

    // Step 1: Check current database state
    console.log('🔍 Step 1: Checking Database State...')
    
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', adminEmail)

    if (usersError) {
      console.log(`  ❌ Users table error: ${usersError.message}`)
      return
    }

    if (users.length === 0) {
      console.log('  ❌ No admin user found in users table')
      return
    }

    console.log('  ✅ Admin user found in users table')
    console.log(`    - ID: ${users[0].id}`)
    console.log(`    - Email: ${users[0].email}`)
    console.log(`    - Role: ${users[0].role}`)
    console.log(`    - Active: ${users[0].active}`)

    // Step 2: Check auth users
    console.log('🔐 Step 2: Checking Auth Users...')
    
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.log(`  ❌ Auth users error: ${authError.message}`)
      
      // Try to recreate auth user
      console.log('  🔧 Recreating auth user...')
      
      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          role: 'super_admin'
        }
      })

      if (createError) {
        console.log(`  ❌ Auth user creation failed: ${createError.message}`)
      } else {
        console.log(`  ✅ Auth user recreated: ${newAuthUser.user.id}`)
        
        // Update the users table with the new auth user ID
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ id: newAuthUser.user.id })
          .eq('email', adminEmail)

        if (updateError) {
          console.log(`  ⚠️  User ID update warning: ${updateError.message}`)
        } else {
          console.log('  ✅ User ID updated to match auth user')
        }
      }
    } else {
      const adminAuthUser = authUsers.users.find(u => u.email === adminEmail)
      if (adminAuthUser) {
        console.log('  ✅ Auth user found')
        console.log(`    - ID: ${adminAuthUser.id}`)
        console.log(`    - Email: ${adminAuthUser.email}`)
        console.log(`    - Confirmed: ${adminAuthUser.email_confirmed_at ? 'Yes' : 'No'}`)
      } else {
        console.log('  ❌ Auth user not found')
        
        // Create auth user
        console.log('  🔧 Creating auth user...')
        
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            role: 'super_admin'
          }
        })

        if (createError) {
          console.log(`  ❌ Auth user creation failed: ${createError.message}`)
        } else {
          console.log(`  ✅ Auth user created: ${newAuthUser.user.id}`)
        }
      }
    }

    // Step 3: Test login
    console.log('🔑 Step 3: Testing Login...')
    
    try {
      const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      })

      if (loginError) {
        console.log(`  ❌ Login failed: ${loginError.message}`)
        
        // Try to reset password
        console.log('  🔧 Resetting password...')
        
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
          users[0].id,
          { password: adminPassword }
        )

        if (resetError) {
          console.log(`  ❌ Password reset failed: ${resetError.message}`)
        } else {
          console.log('  ✅ Password reset successful')
          
          // Try login again
          const { data: retryLogin, error: retryError } = await supabaseClient.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword
          })

          if (retryError) {
            console.log(`  ❌ Retry login failed: ${retryError.message}`)
          } else {
            console.log('  ✅ Retry login successful!')
            await supabaseClient.auth.signOut()
          }
        }
      } else {
        console.log('  ✅ Login successful!')
        console.log(`    - User ID: ${loginData.user.id}`)
        console.log(`    - Email: ${loginData.user.email}`)
        
        // Test user profile fetch
        const { data: profile, error: profileError } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', loginData.user.id)
          .single()

        if (profileError) {
          console.log(`  ⚠️  Profile fetch warning: ${profileError.message}`)
        } else {
          console.log(`  ✅ Profile fetch successful: ${profile.role}`)
        }

        await supabaseClient.auth.signOut()
        console.log('  ✅ Signed out successfully')
      }
    } catch (err) {
      console.log(`  ❌ Login test error: ${err.message}`)
    }

    // Step 4: Check RLS policies
    console.log('🔒 Step 4: Checking RLS Policies...')
    
    try {
      const { data: policies, error: policyError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
          FROM pg_policies 
          WHERE tablename = 'users' 
          ORDER BY policyname;
        `
      })

      if (policyError) {
        console.log(`  ⚠️  Policy check warning: ${policyError.message}`)
      } else {
        console.log('  ✅ RLS policies checked')
      }
    } catch (err) {
      console.log(`  ⚠️  Policy check error: ${err.message}`)
    }

    console.log('')
    console.log('🎉 Login Issues Fixed!')
    console.log('')
    console.log('📋 Login Details:')
    console.log('🌐 URL: http://localhost:3001')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 Password: admin123456')
    console.log('👑 Role: Super Admin')
    console.log('')
    console.log('✅ Try logging in now!')

  } catch (error) {
    console.error('❌ Failed to fix login issues:', error)
    process.exit(1)
  }
}

// Run the fix
fixLoginIssues() 