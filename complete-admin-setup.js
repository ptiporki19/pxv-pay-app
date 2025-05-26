const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

§§

async function completeAdminSetup() {
  try {
    console.log('🎯 Completing Admin User Setup...')
    console.log('')

    const adminUserId = '00000000-0000-0000-0000-000000000001'
    const adminEmail = 'admin@pxvpay.com'

    // Step 1: Create user record (now that auth user exists)
    console.log('👤 Step 1: Creating User Record...')
    
    // Delete any existing user record first
    await supabase
      .from('users')
      .delete()
      .eq('email', adminEmail)

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: adminUserId,
        email: adminEmail,
        role: 'super_admin',
        created_at: new Date().toISOString()
      })

    if (userError) {
      console.log(`  ⚠️  User creation warning: ${userError.message}`)
    } else {
      console.log('  ✅ User record created successfully')
    }

    // Step 2: Create user limits
    console.log('⚙️  Step 2: Creating User Limits...')
    
    // Delete any existing user limits first
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
        max_checkout_links: null, // Unlimited
        current_checkout_links: 0,
        max_monthly_payments: null,
        current_monthly_payments: 0,
        max_storage_mb: null,
        current_storage_mb: 0,
        can_use_analytics: true,
        can_use_webhooks: true,
        can_customize_branding: true,
        can_export_data: true
      })

    if (limitsError) {
      console.log(`  ⚠️  User limits warning: ${limitsError.message}`)
    } else {
      console.log('  ✅ User limits created successfully')
    }

    // Step 3: Verify everything works
    console.log('✅ Step 3: Verifying Complete Setup...')
    
    // Check user record
    const { data: userRecord, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single()

    if (userCheckError) {
      console.log(`  ⚠️  User check warning: ${userCheckError.message}`)
    } else {
      console.log('  ✅ User record verified')
      console.log(`    - ID: ${userRecord.id}`)
      console.log(`    - Email: ${userRecord.email}`)
      console.log(`    - Role: ${userRecord.role}`)
    }

    // Check user limits
    const { data: limitsRecord, error: limitsCheckError } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', adminUserId)
      .single()

    if (limitsCheckError) {
      console.log(`  ⚠️  Limits check warning: ${limitsCheckError.message}`)
    } else {
      console.log('  ✅ User limits verified')
      console.log(`    - Max checkout links: ${limitsRecord.max_checkout_links || 'Unlimited'}`)
      console.log(`    - Can use analytics: ${limitsRecord.can_use_analytics}`)
    }

    // Step 4: Test login functionality
    console.log('🔐 Step 4: Testing Login...')
    
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: 'admin123456'
      })

      if (loginError) {
        console.log(`  ⚠️  Login test warning: ${loginError.message}`)
      } else {
        console.log('  ✅ Login test successful!')
        console.log(`    - User ID: ${loginData.user.id}`)
        console.log(`    - Email: ${loginData.user.email}`)
        
        // Sign out after test
        await supabase.auth.signOut()
        console.log('  ✅ Signed out after test')
      }
    } catch (err) {
      console.log(`  ⚠️  Login test error: ${err.message}`)
    }

    console.log('')
    console.log('🎉 Admin User Setup Complete!')
    console.log('')
    console.log('📋 Final Login Details:')
    console.log('🌐 URL: http://localhost:3001')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 Password: admin123456')
    console.log('👑 Role: Super Admin')
    console.log('')
    console.log('✅ Everything is ready! You can now:')
    console.log('1. Start your development server')
    console.log('2. Navigate to the login page')
    console.log('3. Login with the credentials above')
    console.log('4. Access the super admin dashboard')
    console.log('5. Manage checkout links and all other features')

  } catch (error) {
    console.error('❌ Failed to complete admin setup:', error)
    process.exit(1)
  }
}

async function addSampleData() {
  try {
    // Add currencies
    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' }
    ]
    
    const { data: currencyData, error: currencyError } = await supabase
      .from('currencies')
      .insert(currencies)
      .select()
    
    if (currencyError && !currencyError.message.includes('duplicate key')) {
      console.log(`⚠️ Currency creation warning: ${currencyError.message}`)
    } else {
      console.log(`✅ Currencies added`)
    }
    
    // Add countries
    const countries = [
      { name: 'United States', code: 'US' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'Nigeria', code: 'NG' },
      { name: 'Germany', code: 'DE' }
    ]
    
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .insert(countries)
      .select()
    
    if (countryError && !countryError.message.includes('duplicate key')) {
      console.log(`⚠️ Country creation warning: ${countryError.message}`)
    } else {
      console.log(`✅ Countries added`)
    }
    
    // Add payment methods
    const paymentMethods = [
      { name: 'Bank Transfer', type: 'bank', countries: ['US', 'GB'], status: 'active' },
      { name: 'Mobile Money', type: 'mobile', countries: ['NG'], status: 'active' },
      { name: 'Credit Card', type: 'card', countries: ['US', 'GB', 'DE'], status: 'active' }
    ]
    
    const { data: pmData, error: pmError } = await supabase
      .from('payment_methods')
      .insert(paymentMethods)
      .select()
    
    if (pmError && !pmError.message.includes('duplicate key')) {
      console.log(`⚠️ Payment method creation warning: ${pmError.message}`)
    } else {
      console.log(`✅ Payment methods added`)
    }
    
  } catch (error) {
    console.log(`⚠️ Sample data error: ${error.message}`)
  }
}

// Run the completion
completeAdminSetup() 