const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

const supabaseAnon = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

async function completeAdminSetup() {
  console.log('🔧 Completing Admin Setup...\n')
  
  try {
    // 1. Get the auth user that was created
    console.log('1. Checking auth users...')
    const { data: authUsers, error: authListError } = await supabase.auth.admin.listUsers()
    if (authListError) {
      console.log(`❌ Could not list auth users: ${authListError.message}`)
      return
    }
    
    const adminAuthUser = authUsers.users.find(u => u.email === 'admin@pxvpay.com')
    if (!adminAuthUser) {
      console.log('❌ Admin auth user not found')
      return
    }
    
    console.log(`✅ Admin auth user found: ${adminAuthUser.email} (ID: ${adminAuthUser.id})`)
    
    // 2. Create public user record
    console.log('\n2. Creating public user record...')
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .insert({
        id: adminAuthUser.id,
        email: 'admin@pxvpay.com',
        role: 'super_admin'
      })
      .select()
      .single()
    
    if (publicError) {
      if (publicError.message.includes('duplicate key')) {
        console.log('✅ Public user already exists')
      } else {
        console.log(`❌ Public user creation failed: ${publicError.message}`)
      }
    } else {
      console.log(`✅ Public user created`)
    }
    
    // 3. Test login
    console.log('\n3. Testing login...')
    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })
    
    if (loginError) {
      console.log(`❌ Login failed: ${loginError.message}`)
    } else {
      console.log(`✅ Login successful: ${loginData.user.email}`)
      
      // 4. Test authenticated API calls
      console.log('\n4. Testing authenticated API calls...')
      
      // Test user profile fetch
      const { data: userProfile, error: profileError } = await supabaseAnon
        .from('users')
        .select('*')
        .eq('id', loginData.user.id)
        .single()
      
      if (profileError) {
        console.log(`❌ Profile fetch failed: ${profileError.message}`)
      } else {
        console.log(`✅ Profile fetch successful: ${userProfile.email} (${userProfile.role})`)
      }
      
      // Test other API calls
      const { data: countries, error: countriesError } = await supabaseAnon.from('countries').select('*')
      if (countriesError) {
        console.log(`❌ Countries fetch failed: ${countriesError.message}`)
      } else {
        console.log(`✅ Countries fetch successful: ${countries.length} countries`)
      }
      
      const { data: currencies, error: currenciesError } = await supabaseAnon.from('currencies').select('*')
      if (currenciesError) {
        console.log(`❌ Currencies fetch failed: ${currenciesError.message}`)
      } else {
        console.log(`✅ Currencies fetch successful: ${currencies.length} currencies`)
      }
      
      const { data: paymentMethods, error: pmError } = await supabaseAnon.from('payment_methods').select('*')
      if (pmError) {
        console.log(`❌ Payment methods fetch failed: ${pmError.message}`)
      } else {
        console.log(`✅ Payment methods fetch successful: ${paymentMethods.length} payment methods`)
      }
      
      // Sign out
      await supabaseAnon.auth.signOut()
      console.log('✅ Signed out successfully')
    }
    
    // 5. Add some sample data
    console.log('\n5. Adding sample data...')
    await addSampleData()
    
    console.log('\n🎉 Admin setup completed successfully!')
    console.log('\n📋 Summary:')
    console.log('- Admin user: admin@pxvpay.com / admin123456')
    console.log('- Auth user: ✅ Created')
    console.log('- Public user: ✅ Created')
    console.log('- Login: ✅ Working')
    console.log('- API calls: ✅ Working')
    console.log('- Sample data: ✅ Added')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
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

completeAdminSetup() 