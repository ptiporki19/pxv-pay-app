const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminDirect() {
  try {
    console.log('👤 Creating Admin User Directly in Database...')
    console.log('')

    // Generate a fixed UUID for the admin user
    const adminUserId = '00000000-0000-0000-0000-000000000001'
    const adminEmail = 'admin@pxvpay.com'
    const adminPassword = 'admin123456'

    // Step 1: Create user in auth.users table directly
    console.log('🔐 Step 1: Creating Auth User in Database...')
    
    // First, delete any existing admin user
    await supabase.rpc('exec_sql', { 
      sql: `DELETE FROM auth.users WHERE email = '${adminEmail}';` 
    })

    // Create auth user with hashed password
    const createAuthUserSQL = `
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '${adminUserId}',
        '00000000-0000-0000-0000-000000000000',
        '${adminEmail}',
        crypt('${adminPassword}', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        '',
        '',
        ''
      );
    `

    try {
      await supabase.rpc('exec_sql', { sql: createAuthUserSQL })
      console.log('  ✅ Auth user created in database')
    } catch (err) {
      console.log(`  ⚠️  Auth user warning: ${err.message}`)
    }

    // Step 2: Create user record in users table
    console.log('📝 Step 2: Creating User Record...')
    
    // Delete existing user record
    await supabase
      .from('users')
      .delete()
      .eq('email', adminEmail)

    // Create new user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: adminUserId,
        email: adminEmail,
        role: 'super_admin',
        created_at: new Date().toISOString()
      })

    if (userError) {
      console.log(`  ⚠️  User record warning: ${userError.message}`)
    } else {
      console.log('  ✅ User record created')
    }

    // Step 3: Create user limits
    console.log('⚙️  Step 3: Creating User Limits...')
    
    // Delete existing user limits
    await supabase
      .from('user_limits')
      .delete()
      .eq('user_id', adminUserId)

    // Create user limits
    const { error: limitsError } = await supabase
      .from('user_limits')
      .insert({
        user_id: adminUserId,
        user_role: 'super_admin',
        max_checkout_links: null,
        current_checkout_links: 0,
        can_use_analytics: true,
        can_use_webhooks: true,
        can_customize_branding: true,
        can_export_data: true
      })

    if (limitsError) {
      console.log(`  ⚠️  User limits warning: ${limitsError.message}`)
    } else {
      console.log('  ✅ User limits created')
    }

    // Step 4: Verify the user exists
    console.log('✅ Step 4: Verifying User Creation...')
    
    const { data: userCheck, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single()

    if (checkError) {
      throw new Error(`User verification failed: ${checkError.message}`)
    }

    console.log('  ✅ User verification successful')
    console.log(`  ✅ User ID: ${userCheck.id}`)
    console.log(`  ✅ Role: ${userCheck.role}`)

    console.log('')
    console.log('🎉 Admin User Created Successfully!')
    console.log('')
    console.log('📋 Login Details:')
    console.log('🌐 URL: http://localhost:3001')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 Password: admin123456')
    console.log('👑 Role: Super Admin')
    console.log('')
    console.log('✅ You can now login to your dashboard!')
    console.log('')
    console.log('💡 Note: If login doesn\'t work immediately, try:')
    console.log('   1. Clear browser cache/cookies')
    console.log('   2. Use incognito/private browsing mode')
    console.log('   3. Restart your development server')

  } catch (error) {
    console.error('❌ Failed to create admin user:', error)
    process.exit(1)
  }
}

// Run the admin creation
createAdminDirect() 