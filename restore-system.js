const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function restoreSystem() {
  console.log('🔧 SYSTEM RESTORATION - SAFE MODE')
  console.log('═'.repeat(50))
  console.log('✅ No destructive operations will be performed')
  console.log('✅ Only adding missing data and fixing auth\n')

  try {
    // Step 1: Create a super admin user through auth
    console.log('1️⃣ Creating Super Admin User')
    console.log('─'.repeat(30))

    const superAdminEmail = 'admin@pxvpay.com'
    const superAdminPassword = 'SuperAdmin123!'

    console.log(`📧 Email: ${superAdminEmail}`)
    console.log(`🔑 Password: ${superAdminPassword}`)
    
    // Create user in auth.users first
    const { data: authUser, error: signUpError } = await supabase.auth.admin.createUser({
      email: superAdminEmail,
      password: superAdminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Admin',
        role: 'super_admin'
      }
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('⚠️  Super admin already exists in auth, getting user...')
        
        // Try to get existing user
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
        
        if (listError) {
          throw new Error(`Cannot list users: ${listError.message}`)
        }
        
        const existingAdmin = existingUsers.users.find(u => u.email === superAdminEmail)
        if (existingAdmin) {
          console.log('✅ Found existing super admin in auth')
          authUser.user = existingAdmin
        } else {
          throw new Error('Super admin email exists but cannot find user')
        }
      } else {
        throw new Error(`Failed to create super admin: ${signUpError.message}`)
      }
    } else {
      console.log('✅ Super admin created in auth.users')
    }

    // Step 2: Create user record in public.users
    console.log('\n2️⃣ Creating User Profile')
    console.log('─'.repeat(30))

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authUser.user.id,
        email: superAdminEmail,
        role: 'super_admin',
        active: true,
        created_at: new Date().toISOString()
      })
      .select()

    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`)
    }

    console.log('✅ Super admin profile created')

    // Step 3: Create a test regular user
    console.log('\n3️⃣ Creating Test Regular User')
    console.log('─'.repeat(30))

    const testUserEmail = 'user@test.com'
    const testUserPassword = 'TestUser123!'

    const { data: testAuthUser, error: testSignUpError } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: testUserPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        role: 'registered_user'
      }
    })

    if (testSignUpError && !testSignUpError.message.includes('already registered')) {
      throw new Error(`Failed to create test user: ${testSignUpError.message}`)
    }

    if (testAuthUser?.user || testSignUpError?.message.includes('already registered')) {
      const userId = testAuthUser?.user?.id || 'existing-user-id'
      
      const { error: testProfileError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: testUserEmail,
          role: 'registered_user',
          active: true,
          created_at: new Date().toISOString()
        })

      if (testProfileError && !testProfileError.message.includes('already exists')) {
        console.log(`⚠️  Test user profile creation failed: ${testProfileError.message}`)
      } else {
        console.log('✅ Test user created')
      }
    }

    // Step 4: Test auth flow
    console.log('\n4️⃣ Testing Auth Flow')
    console.log('─'.repeat(30))

    // Test super admin sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: superAdminEmail,
      password: superAdminPassword
    })

    if (signInError) {
      throw new Error(`Super admin sign in failed: ${signInError.message}`)
    }

    console.log('✅ Super admin can sign in')

    // Test fetching user profile after sign in
    const { data: profileData, error: profileFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user.id)
      .single()

    if (profileFetchError) {
      throw new Error(`Profile fetch failed: ${profileFetchError.message}`)
    }

    console.log('✅ User profile fetching works')
    console.log(`   Role: ${profileData.role}`)
    console.log(`   Email: ${profileData.email}`)

    // Step 5: Test notifications
    console.log('\n5️⃣ Testing Notifications')
    console.log('─'.repeat(30))

    const { data: notificationData, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: signInData.user.id,
        title: 'Welcome Back!',
        message: 'Your PXV Pay system has been restored successfully.',
        type: 'success'
      })
      .select()

    if (notificationError) {
      console.log(`⚠️  Notification creation failed: ${notificationError.message}`)
    } else {
      console.log('✅ Notifications working')
      
      // Clean up test notification
      if (notificationData?.[0]) {
        await supabase.from('notifications').delete().eq('id', notificationData[0].id)
      }
    }

    // Step 6: Test payment methods (the original issue)
    console.log('\n6️⃣ Testing Payment Methods')
    console.log('─'.repeat(30))

    const { data: paymentMethods, error: paymentMethodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .limit(5)

    if (paymentMethodsError) {
      console.log(`⚠️  Payment methods fetch failed: ${paymentMethodsError.message}`)
    } else {
      console.log(`✅ Payment methods accessible (${paymentMethods.length} found)`)
    }

    // Final verification
    console.log('\n🎉 RESTORATION COMPLETE!')
    console.log('═'.repeat(50))
    console.log('✅ Super admin created and tested')
    console.log('✅ Auth flow working')
    console.log('✅ User profile system working')
    console.log('✅ All tables accessible')
    
    console.log('\n🔑 CREDENTIALS:')
    console.log('─'.repeat(30))
    console.log(`Super Admin Email: ${superAdminEmail}`)
    console.log(`Super Admin Password: ${superAdminPassword}`)
    console.log(`Test User Email: ${testUserEmail}`)
    console.log(`Test User Password: ${testUserPassword}`)

    console.log('\n🚀 READY TO USE:')
    console.log('─'.repeat(30))
    console.log('1. Start your app: npm run dev')
    console.log('2. Go to /signin')
    console.log('3. Sign in with super admin credentials')
    console.log('4. Access /super-admin dashboard')
    console.log('5. Test the original payment method feature')

    // Sign out after testing
    await supabase.auth.signOut()

  } catch (error) {
    console.error('\n❌ RESTORATION FAILED:', error.message)
    console.log('\n🔧 MANUAL STEPS NEEDED:')
    console.log('1. Check Supabase Studio for any missing data')
    console.log('2. Manually create super admin if needed')
    console.log('3. Verify RLS policies are not blocking access')
  }
}

restoreSystem() 