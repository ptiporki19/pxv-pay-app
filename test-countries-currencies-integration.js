const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function testCountriesCurrenciesIntegration() {
  console.log('🧪 Testing Countries and Currencies Integration...\n')
  
  try {
    // 1. Test specific countries with their currencies
    console.log('1. Testing specific countries with currencies...')
    const testCountries = ['GA', 'NG', 'US', 'GB', 'FR', 'AL'] // Including Gabon, Albania (fixed), and others
    
    for (const countryCode of testCountries) {
      const { data: country, error } = await supabase
        .from('countries')
        .select('name, code, currency_code')
        .eq('code', countryCode)
        .is('user_id', null)
        .single()
      
      if (error) {
        console.log(`   ❌ ${countryCode}: Error - ${error.message}`)
        continue
      }
      
      if (!country) {
        console.log(`   ❌ ${countryCode}: Not found`)
        continue
      }
      
      // Get currency details
      const { data: currency } = await supabase
        .from('currencies')
        .select('name, code, symbol')
        .eq('code', country.currency_code)
        .is('user_id', null)
        .single()
      
      if (currency) {
        console.log(`   ✅ ${country.name} (${country.code}) -> ${currency.name} (${currency.code}) ${currency.symbol}`)
      } else {
        console.log(`   ⚠️  ${country.name} (${country.code}) -> Currency ${country.currency_code} not found`)
      }
    }
    
    // 2. Test the countries API endpoint simulation
    console.log('\n2. Testing countries API with currency lookup...')
    const activeCountryCodes = ['GA', 'NG', 'US', 'GB', 'FR']
    
    // Simulate the API call
    const { data: countries } = await supabase
      .from('countries')
      .select('id, name, code, currency_code')
      .in('code', activeCountryCodes)
      .eq('status', 'active')
      .is('user_id', null)
      .order('name')
    
    if (!countries || countries.length === 0) {
      console.log('   ❌ No countries found')
      return
    }
    
    // Get currency codes
    const currencyCodes = [...new Set(countries.map(c => c.currency_code).filter(Boolean))]
    
    // Fetch currencies
    const { data: currencies } = await supabase
      .from('currencies')
      .select('id, name, code, symbol')
      .in('code', currencyCodes)
      .eq('status', 'active')
      .is('user_id', null)
    
    // Create currency map
    const currencyMap = new Map(currencies?.map(c => [c.code, c]) || [])
    
    // Attach currency data
    const countriesWithCurrency = countries.map(country => ({
      ...country,
      currency: country.currency_code ? currencyMap.get(country.currency_code) || null : null
    }))
    
    console.log('   Countries with currencies:')
    countriesWithCurrency.forEach(country => {
      if (country.currency) {
        console.log(`   ✅ ${country.name} (${country.code}) -> ${country.currency.name} (${country.currency.code}) ${country.currency.symbol}`)
      } else {
        console.log(`   ❌ ${country.name} (${country.code}) -> No currency data`)
      }
    })
    
    // 3. Test African CFA currencies specifically
    console.log('\n3. Testing African CFA currencies...')
    const cfaCountries = ['GA', 'CM', 'CF', 'TD', 'CG', 'GQ'] // XAF countries
    const cfaWestCountries = ['BJ', 'BF', 'CI', 'GW', 'ML', 'NE', 'SN', 'TG'] // XOF countries
    
    console.log('   XAF (Central African CFA) countries:')
    for (const code of cfaCountries) {
      const { data: country } = await supabase
        .from('countries')
        .select('name, code, currency_code')
        .eq('code', code)
        .is('user_id', null)
        .single()
      
      if (country) {
        console.log(`   ${country.currency_code === 'XAF' ? '✅' : '❌'} ${country.name} (${country.code}) -> ${country.currency_code}`)
      }
    }
    
    console.log('   XOF (West African CFA) countries:')
    for (const code of cfaWestCountries) {
      const { data: country } = await supabase
        .from('countries')
        .select('name, code, currency_code')
        .eq('code', code)
        .is('user_id', null)
        .single()
      
      if (country) {
        console.log(`   ${country.currency_code === 'XOF' ? '✅' : '❌'} ${country.name} (${country.code}) -> ${country.currency_code}`)
      }
    }
    
    // 4. Test currency symbols
    console.log('\n4. Testing currency symbols...')
    const testCurrencies = ['XAF', 'XOF', 'USD', 'EUR', 'GBP', 'NGN', 'ALL']
    
    for (const currencyCode of testCurrencies) {
      const { data: currency } = await supabase
        .from('currencies')
        .select('name, code, symbol')
        .eq('code', currencyCode)
        .is('user_id', null)
        .single()
      
      if (currency) {
        console.log(`   ✅ ${currency.code}: ${currency.name} (${currency.symbol})`)
      } else {
        console.log(`   ❌ ${currencyCode}: Not found`)
      }
    }
    
    // 5. Final summary
    console.log('\n5. Final summary...')
    const { data: totalCountries } = await supabase.from('countries').select('*', { count: 'exact' }).is('user_id', null)
    const { data: totalCurrencies } = await supabase.from('currencies').select('*', { count: 'exact' }).is('user_id', null)
    
    console.log(`   📊 Total countries: ${totalCountries?.length || 0}`)
    console.log(`   💰 Total currencies: ${totalCurrencies?.length || 0}`)
    
    // Check Gabon specifically
    const { data: gabon } = await supabase
      .from('countries')
      .select('name, code, currency_code')
      .eq('code', 'GA')
      .is('user_id', null)
      .single()
    
    if (gabon) {
      const { data: gabonCurrency } = await supabase
        .from('currencies')
        .select('name, code, symbol')
        .eq('code', gabon.currency_code)
        .is('user_id', null)
        .single()
      
      console.log(`   🇬🇦 Gabon: ${gabon.name} (${gabon.code}) -> ${gabonCurrency?.name} (${gabonCurrency?.code}) ${gabonCurrency?.symbol}`)
    } else {
      console.log(`   ❌ Gabon not found`)
    }
    
    console.log('\n🎉 Countries and currencies integration test complete!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testCountriesCurrenciesIntegration() 