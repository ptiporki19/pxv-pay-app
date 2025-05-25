const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function testCurrencyRelationship() {
  console.log('🔍 Testing Currency Relationship...\n')
  
  try {
    // 1. Test basic countries fetch
    console.log('1. Testing basic countries fetch...')
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
    
    if (countriesError) {
      console.log(`❌ Countries fetch failed: ${countriesError.message}`)
      return
    }
    
    console.log(`✅ Countries fetched: ${countries.length}`)
    console.log('Countries:', countries.map(c => `${c.name} (${c.code}) - currency_id: ${c.currency_id}`))
    
    // 2. Test countries with currency join
    console.log('\n2. Testing countries with currency join...')
    const { data: countriesWithCurrency, error: joinError } = await supabase
      .from('countries')
      .select(`
        *,
        currency:currencies(id, name, code, symbol)
      `)
    
    if (joinError) {
      console.log(`❌ Currency join failed: ${joinError.message}`)
    } else {
      console.log(`✅ Countries with currency join: ${countriesWithCurrency.length}`)
      countriesWithCurrency.forEach(country => {
        console.log(`  ${country.name}: ${country.currency?.name || 'No currency'} (${country.currency?.symbol || 'N/A'})`)
      })
    }
    
    // 3. Test the original problematic query
    console.log('\n3. Testing original problematic query...')
    const { data: originalQuery, error: originalError } = await supabase
      .from('countries')
      .select('*, currency_id')
    
    if (originalError) {
      console.log(`❌ Original query failed: ${originalError.message}`)
    } else {
      console.log(`✅ Original query working: ${originalQuery.length} countries`)
    }
    
    console.log('\n🎉 Currency relationship test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testCurrencyRelationship() 