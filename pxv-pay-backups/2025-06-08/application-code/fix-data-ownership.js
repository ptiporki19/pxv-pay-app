const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function fixDataOwnership() {
  console.log('🔧 Fixing Data Ownership - Associating Data with Admin User...\n')
  
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
    
    // Fix countries ownership
    console.log('\n1. Fixing countries ownership...')
    const { data: updatedCountries, error: countriesError } = await supabase
      .from('countries')
      .update({ user_id: adminUser.id })
      .is('user_id', null)
      .select()
    
    if (countriesError) {
      console.log(`❌ Countries update failed: ${countriesError.message}`)
    } else {
      console.log(`✅ Updated ${updatedCountries.length} countries`)
      updatedCountries.forEach(c => console.log(`  - ${c.name} (${c.code})`))
    }
    
    // Fix currencies ownership
    console.log('\n2. Fixing currencies ownership...')
    const { data: updatedCurrencies, error: currenciesError } = await supabase
      .from('currencies')
      .update({ user_id: adminUser.id })
      .is('user_id', null)
      .select()
    
    if (currenciesError) {
      console.log(`❌ Currencies update failed: ${currenciesError.message}`)
    } else {
      console.log(`✅ Updated ${updatedCurrencies.length} currencies`)
      updatedCurrencies.forEach(c => console.log(`  - ${c.name} (${c.code})`))
    }
    
    // Fix payment methods ownership
    console.log('\n3. Fixing payment methods ownership...')
    const { data: updatedPaymentMethods, error: paymentMethodsError } = await supabase
      .from('payment_methods')
      .update({ user_id: adminUser.id })
      .is('user_id', null)
      .select()
    
    if (paymentMethodsError) {
      console.log(`❌ Payment methods update failed: ${paymentMethodsError.message}`)
    } else {
      console.log(`✅ Updated ${updatedPaymentMethods.length} payment methods`)
      updatedPaymentMethods.forEach(p => console.log(`  - ${p.name} (${p.type})`))
    }
    
    // Test frontend API calls after fix
    console.log('\n4. Testing frontend API calls after fix...')
    
    // Test countries
    const { data: frontendCountries, error: frontendCountriesError } = await supabase
      .from('countries')
      .select('*')
      .eq('user_id', adminUser.id)
      .order('name', { ascending: true })
    
    if (frontendCountriesError) {
      console.log(`❌ Frontend countries test failed: ${frontendCountriesError.message}`)
    } else {
      console.log(`✅ Frontend countries test: ${frontendCountries.length} countries`)
    }
    
    // Test currencies
    const { data: frontendCurrencies, error: frontendCurrenciesError } = await supabase
      .from('currencies')
      .select('*')
      .eq('user_id', adminUser.id)
      .order('name', { ascending: true })
    
    if (frontendCurrenciesError) {
      console.log(`❌ Frontend currencies test failed: ${frontendCurrenciesError.message}`)
    } else {
      console.log(`✅ Frontend currencies test: ${frontendCurrencies.length} currencies`)
    }
    
    // Test payment methods
    const { data: frontendPaymentMethods, error: frontendPMError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', adminUser.id)
      .order('name', { ascending: true })
    
    if (frontendPMError) {
      console.log(`❌ Frontend payment methods test failed: ${frontendPMError.message}`)
    } else {
      console.log(`✅ Frontend payment methods test: ${frontendPaymentMethods.length} payment methods`)
    }
    
    console.log('\n🎉 Data ownership fix completed!')
    console.log('\n📋 SUMMARY:')
    console.log(`✅ Countries: ${frontendCountries?.length || 0} now visible to admin`)
    console.log(`✅ Currencies: ${frontendCurrencies?.length || 0} now visible to admin`)
    console.log(`✅ Payment Methods: ${frontendPaymentMethods?.length || 0} now visible to admin`)
    console.log('\n🚀 Your frontend pages should now display the data!')
    console.log('   - Countries page: Will show all countries')
    console.log('   - Currencies page: Will show all currencies')
    console.log('   - Payment methods page: Will show all payment methods')
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  }
}

fixDataOwnership() 