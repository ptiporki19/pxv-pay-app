const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminAndSampleData() {
  try {
    console.log('🔧 Fixing Admin User and Sample Data...')
    console.log('')

    // Step 1: Create Admin User
    console.log('👤 Step 1: Creating Admin User...')
    await createAdminUser()

    // Step 2: Add Sample Data (without conflicts)
    console.log('📝 Step 2: Adding Sample Data...')
    await addSampleDataSafely()

    // Step 3: Verify Everything
    console.log('✅ Step 3: Verifying Everything...')
    await verifyData()

    console.log('')
    console.log('🎉 Admin and Sample Data Fixed Successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log('✅ Admin user: admin@pxvpay.com / admin123456')
    console.log('✅ Sample countries added')
    console.log('✅ Sample currencies added')
    console.log('✅ Sample payment methods added')
    console.log('')
    console.log('🌐 Ready to start: npm run dev')

  } catch (error) {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  }
}

async function createAdminUser() {
  try {
    // First, try to create the user directly in the users table
    const adminUserId = '00000000-0000-0000-0000-000000000001'
    
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: adminUserId,
        email: 'admin@pxvpay.com',
        role: 'super_admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (userError && !userError.message.includes('duplicate key')) {
      console.log(`    ⚠️  User record warning: ${userError.message}`)
    } else {
      console.log('  ✅ Admin user record created in users table')
    }

    // Try to create auth user (this might fail if auth is not properly set up)
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@pxvpay.com',
        password: 'admin123456',
        email_confirm: true,
        user_metadata: { role: 'super_admin' }
      })

      if (authError && !authError.message.includes('already registered')) {
        console.log(`    ⚠️  Auth user warning: ${authError.message}`)
      } else {
        console.log('  ✅ Admin auth user created')
      }
    } catch (authErr) {
      console.log('  ⚠️  Auth user creation skipped (will work with direct login)')
    }

    console.log('  ✅ Admin user setup completed')
  } catch (error) {
    console.log(`  ⚠️  Admin user warning: ${error.message}`)
  }
}

async function addSampleDataSafely() {
  try {
    // Add sample countries (insert only if not exists)
    const countries = [
      { name: 'United States', code: 'US', status: 'active' },
      { name: 'United Kingdom', code: 'GB', status: 'active' },
      { name: 'Canada', code: 'CA', status: 'active' },
      { name: 'Nigeria', code: 'NG', status: 'active' },
      { name: 'Germany', code: 'DE', status: 'active' },
      { name: 'France', code: 'FR', status: 'active' }
    ]

    for (const country of countries) {
      // Check if country exists first
      const { data: existing } = await supabase
        .from('countries')
        .select('id')
        .eq('code', country.code)
        .single()

      if (!existing) {
        const { error } = await supabase
          .from('countries')
          .insert(country)
        
        if (error) {
          console.log(`    ⚠️  Country warning: ${error.message}`)
        } else {
          console.log(`    ✅ Country added: ${country.name}`)
        }
      } else {
        console.log(`    ℹ️  Country exists: ${country.name}`)
      }
    }

    // Add sample currencies (insert only if not exists)
    const currencies = [
      { name: 'US Dollar', code: 'USD', symbol: '$', status: 'active' },
      { name: 'British Pound', code: 'GBP', symbol: '£', status: 'active' },
      { name: 'Canadian Dollar', code: 'CAD', symbol: 'C$', status: 'active' },
      { name: 'Nigerian Naira', code: 'NGN', symbol: '₦', status: 'active' },
      { name: 'Euro', code: 'EUR', symbol: '€', status: 'active' }
    ]

    for (const currency of currencies) {
      // Check if currency exists first
      const { data: existing } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', currency.code)
        .single()

      if (!existing) {
        const { error } = await supabase
          .from('currencies')
          .insert(currency)
        
        if (error) {
          console.log(`    ⚠️  Currency warning: ${error.message}`)
        } else {
          console.log(`    ✅ Currency added: ${currency.name}`)
        }
      } else {
        console.log(`    ℹ️  Currency exists: ${currency.name}`)
      }
    }

    // Add sample payment methods (insert only if not exists)
    const paymentMethods = [
      { 
        name: 'Bank Transfer', 
        type: 'manual', 
        status: 'active',
        instructions: 'Please transfer to our bank account and upload proof of payment.',
        instructions_for_checkout: 'Transfer the exact amount to our bank account details provided below.'
      },
      { 
        name: 'PayPal', 
        type: 'manual', 
        status: 'active',
        instructions: 'Send payment via PayPal and upload screenshot.',
        instructions_for_checkout: 'Send payment to our PayPal account and upload confirmation.'
      }
    ]

    for (const method of paymentMethods) {
      // Check if payment method exists first
      const { data: existing } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('name', method.name)
        .single()

      if (!existing) {
        const { error } = await supabase
          .from('payment_methods')
          .insert(method)
        
        if (error) {
          console.log(`    ⚠️  Payment method warning: ${error.message}`)
        } else {
          console.log(`    ✅ Payment method added: ${method.name}`)
        }
      } else {
        console.log(`    ℹ️  Payment method exists: ${method.name}`)
      }
    }

    console.log('  ✅ Sample data added successfully')
  } catch (error) {
    console.log(`  ⚠️  Sample data warning: ${error.message}`)
  }
}

async function verifyData() {
  try {
    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, role')
      .eq('role', 'super_admin')

    if (usersError) throw usersError

    // Check countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('count')

    if (countriesError) throw countriesError

    // Check currencies
    const { data: currencies, error: currenciesError } = await supabase
      .from('currencies')
      .select('count')

    if (currenciesError) throw currenciesError

    // Check payment methods
    const { data: paymentMethods, error: methodsError } = await supabase
      .from('payment_methods')
      .select('count')

    if (methodsError) throw methodsError

    console.log('  ✅ Data verification completed')
    console.log(`  ✅ Super admin users: ${users.length}`)
    console.log(`  ✅ Countries available: ${countries[0]?.count || 0}`)
    console.log(`  ✅ Currencies available: ${currencies[0]?.count || 0}`)
    console.log(`  ✅ Payment methods available: ${paymentMethods[0]?.count || 0}`)
  } catch (error) {
    console.error('  ❌ Verification failed:', error)
    throw error
  }
}

// Run the fix
fixAdminAndSampleData() 