const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSimpleAdmin() {
  try {
    console.log('👤 Creating Simple Admin User...')
    console.log('')

    // Step 1: Check current users
    console.log('🔍 Step 1: Checking Current Users...')
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('*')

    if (checkError) {
      console.log(`  ⚠️  Check error: ${checkError.message}`)
    } else {
      console.log(`  ℹ️  Found ${existingUsers.length} existing users`)
      existingUsers.forEach(user => {
        console.log(`    - ${user.email} (${user.role})`)
      })
    }

    // Step 2: Create admin user using auth.admin.createUser
    console.log('🔐 Step 2: Creating Admin User via Auth API...')
    
    try {
      // Delete existing admin if exists
      const existingAdmin = existingUsers?.find(u => u.email === 'admin@pxvpay.com')
      if (existingAdmin) {
        console.log('  🗑️  Removing existing admin user...')
        await supabase
          .from('users')
          .delete()
          .eq('email', 'admin@pxvpay.com')
      }

      // Create new admin user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@pxvpay.com',
        password: 'admin123456',
        email_confirm: true,
        user_metadata: {
          role: 'super_admin'
        }
      })

      if (authError) {
        console.log(`  ⚠️  Auth creation warning: ${authError.message}`)
        
        // If auth creation fails, create user record manually
        console.log('  🔧 Creating user record manually...')
        const manualUserId = '00000000-0000-0000-0000-000000000001'
        
        const { error: manualError } = await supabase
          .from('users')
          .insert({
            id: manualUserId,
            email: 'admin@pxvpay.com',
            role: 'super_admin',
            created_at: new Date().toISOString()
          })

        if (manualError) {
          console.log(`  ⚠️  Manual creation warning: ${manualError.message}`)
        } else {
          console.log('  ✅ Manual user record created')
        }
      } else {
        console.log(`  ✅ Auth user created with ID: ${authUser.user.id}`)
        
        // Create corresponding user record
        const { error: userRecordError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            email: authUser.user.email,
            role: 'super_admin',
            created_at: new Date().toISOString()
          })

        if (userRecordError) {
          console.log(`  ⚠️  User record warning: ${userRecordError.message}`)
        } else {
          console.log('  ✅ User record created')
        }
      }

    } catch (err) {
      console.log(`  ⚠️  Auth API error: ${err.message}`)
    }

    // Step 3: Verify final result
    console.log('✅ Step 3: Verifying Final Result...')
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pxvpay.com')

    if (finalError) {
      console.log(`  ❌ Verification failed: ${finalError.message}`)
    } else if (finalUsers.length === 0) {
      console.log('  ❌ No admin user found after creation')
    } else {
      const adminUser = finalUsers[0]
      console.log('  ✅ Admin user verified!')
      console.log(`    - ID: ${adminUser.id}`)
      console.log(`    - Email: ${adminUser.email}`)
      console.log(`    - Role: ${adminUser.role}`)
      console.log(`    - Created: ${adminUser.created_at}`)
    }

    console.log('')
    console.log('🎉 Admin User Setup Complete!')
    console.log('')
    console.log('📋 Login Details:')
    console.log('🌐 URL: http://localhost:3001')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 Password: admin123456')
    console.log('👑 Role: Super Admin')
    console.log('')
    console.log('💡 Next Steps:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Navigate to http://localhost:3001')
    console.log('3. Try logging in with the credentials above')
    console.log('4. If login fails, the user record exists but auth might need setup')

  } catch (error) {
    console.error('❌ Failed to create admin user:', error)
    process.exit(1)
  }
}

// Run the admin creation
createSimpleAdmin() 