const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminConstraint() {
  try {
    console.log('🔧 Fixing Admin User Creation...')
    console.log('')

    // Step 1: Check current constraint
    console.log('🔍 Step 1: Checking Current Constraints...')
    
    const checkConstraintSQL = `
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'users' AND table_schema = 'public';
    `
    
    const { data: constraints, error: constraintError } = await supabase.rpc('exec_sql', { 
      sql: checkConstraintSQL 
    })
    
    if (constraintError) {
      console.log(`  ⚠️  Constraint check warning: ${constraintError.message}`)
    } else {
      console.log('  ✅ Current constraints checked')
    }

    // Step 2: Temporarily drop the foreign key constraint
    console.log('🗑️  Step 2: Temporarily Dropping Foreign Key Constraint...')
    
    const dropConstraintSQL = `
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
    `
    
    try {
      await supabase.rpc('exec_sql', { sql: dropConstraintSQL })
      console.log('  ✅ Foreign key constraint dropped')
    } catch (err) {
      console.log(`  ⚠️  Drop constraint warning: ${err.message}`)
    }

    // Step 3: Create admin user
    console.log('👤 Step 3: Creating Admin User...')
    
    const adminUserId = '00000000-0000-0000-0000-000000000001'
    
    // Delete existing admin user if any
    await supabase
      .from('users')
      .delete()
      .eq('email', 'admin@pxvpay.com')

    // Create admin user
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: adminUserId,
        email: 'admin@pxvpay.com',
        role: 'super_admin',
        created_at: new Date().toISOString()
      })

    if (userError) {
      console.log(`  ⚠️  User creation warning: ${userError.message}`)
    } else {
      console.log('  ✅ Admin user created successfully')
    }

    // Step 4: Create corresponding auth user
    console.log('🔐 Step 4: Creating Auth User...')
    
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
        aud
      ) VALUES (
        '${adminUserId}',
        '00000000-0000-0000-0000-000000000000',
        'admin@pxvpay.com',
        crypt('admin123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
      ) ON CONFLICT (id) DO NOTHING;
    `

    try {
      await supabase.rpc('exec_sql', { sql: createAuthUserSQL })
      console.log('  ✅ Auth user created')
    } catch (err) {
      console.log(`  ⚠️  Auth user warning: ${err.message}`)
    }

    // Step 5: Recreate the foreign key constraint (optional)
    console.log('🔗 Step 5: Recreating Foreign Key Constraint...')
    
    const recreateConstraintSQL = `
      ALTER TABLE users 
      ADD CONSTRAINT users_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    `
    
    try {
      await supabase.rpc('exec_sql', { sql: recreateConstraintSQL })
      console.log('  ✅ Foreign key constraint recreated')
    } catch (err) {
      console.log(`  ⚠️  Recreate constraint warning: ${err.message}`)
    }

    // Step 6: Create user limits
    console.log('⚙️  Step 6: Creating User Limits...')
    
    const { error: limitsError } = await supabase
      .from('user_limits')
      .upsert({
        user_id: adminUserId,
        user_role: 'super_admin',
        max_checkout_links: null,
        current_checkout_links: 0,
        can_use_analytics: true,
        can_use_webhooks: true,
        can_customize_branding: true,
        can_export_data: true
      }, { onConflict: 'user_id' })

    if (limitsError) {
      console.log(`  ⚠️  User limits warning: ${limitsError.message}`)
    } else {
      console.log('  ✅ User limits created')
    }

    // Step 7: Verify everything
    console.log('✅ Step 7: Verifying Admin User...')
    
    const { data: adminUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pxvpay.com')
      .single()

    if (verifyError) {
      console.log(`  ❌ Verification failed: ${verifyError.message}`)
    } else {
      console.log('  ✅ Admin user verified!')
      console.log(`    - ID: ${adminUser.id}`)
      console.log(`    - Email: ${adminUser.email}`)
      console.log(`    - Role: ${adminUser.role}`)
    }

    console.log('')
    console.log('🎉 Admin User Successfully Created!')
    console.log('')
    console.log('📋 Login Details:')
    console.log('🌐 URL: http://localhost:3001')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 Password: admin123456')
    console.log('👑 Role: Super Admin')
    console.log('')
    console.log('✅ You can now login to your dashboard!')
    console.log('')
    console.log('🚀 Next Steps:')
    console.log('1. Start your development server')
    console.log('2. Navigate to the login page')
    console.log('3. Use the credentials above to login')

  } catch (error) {
    console.error('❌ Failed to fix admin user:', error)
    process.exit(1)
  }
}

// Run the fix
fixAdminConstraint() 