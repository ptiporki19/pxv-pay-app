const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function checkDataOwnership() {
  console.log('🔍 Checking Data Ownership and User ID Associations...\n')
  
  try {
    // Get admin user ID
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pxvpay.com')
      .single()
    
    if (adminError) {
      console.log(`❌ Admin user fetch failed: ${adminError.message}`)
      return
    }
    
    console.log(`✅ Admin user: ${adminUser.email} (ID: ${adminUser.id})`)
    
    // Check countries
    console.log('\n📍 Countries:')
    const { data: countries } = await supabase.from('countries').select('*')
    if (countries && countries.length > 0) {
      countries.forEach(c => {
        console.log(`  ${c.name} (${c.code}) - user_id: ${c.user_id || 'NULL'}`)
      })
    } else {
      console.log('  No countries found')
    }
    
    // Check currencies  
    console.log('\n💰 Currencies:')
    const { data: currencies } = await supabase.from('currencies').select('*')
    if (currencies && currencies.length > 0) {
      currencies.forEach(c => {
        console.log(`  ${c.name} (${c.code}) - user_id: ${c.user_id || 'NULL'}`)
      })
    } else {
      console.log('  No currencies found')
    }
    
    // Check payment methods
    console.log('\n💳 Payment Methods:')
    const { data: paymentMethods } = await supabase.from('payment_methods').select('*')
    if (paymentMethods && paymentMethods.length > 0) {
      paymentMethods.forEach(p => {
        console.log(`  ${p.name} (${p.type}) - user_id: ${p.user_id || 'NULL'}`)
      })
    } else {
      console.log('  No payment methods found')
    }
    
    // Test frontend API calls (simulating what the frontend does)
    console.log('\n🔍 Testing Frontend API Calls (with user_id filter):')
    
    // Test countries API call (like frontend does)
    const { data: frontendCountries, error: frontendCountriesError } = await supabase
      .from('countries')
      .select('*')
      .eq('user_id', adminUser.id)
      .order('name', { ascending: true })
    
    if (frontendCountriesError) {
      console.log(`❌ Frontend countries fetch failed: ${frontendCountriesError.message}`)
    } else {
      console.log(`✅ Frontend countries fetch: ${frontendCountries.length} countries`)
    }
    
    // Test currencies API call (like frontend does)
    const { data: frontendCurrencies, error: frontendCurrenciesError } = await supabase
      .from('currencies')
      .select('*')
      .eq('user_id', adminUser.id)
      .order('name', { ascending: true })
    
    if (frontendCurrenciesError) {
      console.log(`❌ Frontend currencies fetch failed: ${frontendCurrenciesError.message}`)
    } else {
      console.log(`✅ Frontend currencies fetch: ${frontendCurrencies.length} currencies`)
    }
    
    // Test payment methods API call (like frontend does)
    const { data: frontendPaymentMethods, error: frontendPMError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', adminUser.id)
      .order('name', { ascending: true })
    
    if (frontendPMError) {
      console.log(`❌ Frontend payment methods fetch failed: ${frontendPMError.message}`)
    } else {
      console.log(`✅ Frontend payment methods fetch: ${frontendPaymentMethods.length} payment methods`)
    }
    
    console.log('\n📋 DIAGNOSIS:')
    const hasCountriesWithoutUserId = countries?.some(c => !c.user_id)
    const hasCurrenciesWithoutUserId = currencies?.some(c => !c.user_id)
    const hasPaymentMethodsWithoutUserId = paymentMethods?.some(p => !p.user_id)
    
    if (hasCountriesWithoutUserId || hasCurrenciesWithoutUserId || hasPaymentMethodsWithoutUserId) {
      console.log('❌ ISSUE FOUND: Data exists but lacks user_id associations')
      console.log('   This is why frontend pages show empty - they filter by user_id')
      console.log('   Need to update data to associate with admin user')
    } else {
      console.log('✅ All data properly associated with users')
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkDataOwnership() 