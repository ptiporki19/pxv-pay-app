const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

// Countries with incorrect currency mappings that need to be fixed
const CURRENCY_FIXES = [
  // Central African CFA (XAF) countries
  { code: 'CM', name: 'Cameroon', correctCurrency: 'XAF' },
  
  // West African CFA (XOF) countries  
  { code: 'CI', name: 'Ivory Coast', correctCurrency: 'XOF' },
  { code: 'SN', name: 'Senegal', correctCurrency: 'XOF' },
  
  // Other potential fixes based on real-world currencies
  { code: 'MA', name: 'Morocco', correctCurrency: 'MAD' },
  { code: 'TN', name: 'Tunisia', correctCurrency: 'TND' },
  { code: 'DZ', name: 'Algeria', correctCurrency: 'DZD' },
  { code: 'EG', name: 'Egypt', correctCurrency: 'EGP' },
]

async function fixRemainingCurrencyMappings() {
  console.log('🔧 Fixing Remaining Currency Mappings...\n')
  
  try {
    let fixedCount = 0
    
    for (const fix of CURRENCY_FIXES) {
      // Check current mapping
      const { data: country } = await supabase
        .from('countries')
        .select('name, code, currency_code')
        .eq('code', fix.code)
        .is('user_id', null)
        .single()
      
      if (!country) {
        console.log(`   ❌ ${fix.name} (${fix.code}): Country not found`)
        continue
      }
      
      if (country.currency_code === fix.correctCurrency) {
        console.log(`   ✅ ${fix.name} (${fix.code}): Already correct (${fix.correctCurrency})`)
        continue
      }
      
      // Check if the target currency exists
      const { data: currency } = await supabase
        .from('currencies')
        .select('code, name')
        .eq('code', fix.correctCurrency)
        .is('user_id', null)
        .single()
      
      if (!currency) {
        console.log(`   ❌ ${fix.name} (${fix.code}): Target currency ${fix.correctCurrency} not found`)
        continue
      }
      
      // Update the country's currency
      const { error } = await supabase
        .from('countries')
        .update({ currency_code: fix.correctCurrency })
        .eq('code', fix.code)
        .is('user_id', null)
      
      if (error) {
        console.log(`   ❌ ${fix.name} (${fix.code}): Error updating - ${error.message}`)
      } else {
        console.log(`   ✅ ${fix.name} (${fix.code}): ${country.currency_code} -> ${fix.correctCurrency}`)
        fixedCount++
      }
    }
    
    console.log(`\n📊 Summary: Fixed ${fixedCount} currency mappings`)
    
    // Verify the CFA countries again
    console.log('\n🔍 Verifying CFA countries after fixes...')
    
    const cfaXafCountries = ['GA', 'CM', 'CF', 'TD', 'CG', 'GQ']
    const cfaXofCountries = ['BJ', 'BF', 'CI', 'GW', 'ML', 'NE', 'SN', 'TG']
    
    console.log('   XAF (Central African CFA) countries:')
    for (const code of cfaXafCountries) {
      const { data: country } = await supabase
        .from('countries')
        .select('name, code, currency_code')
        .eq('code', code)
        .is('user_id', null)
        .single()
      
      if (country) {
        const status = country.currency_code === 'XAF' ? '✅' : '❌'
        console.log(`   ${status} ${country.name} (${country.code}) -> ${country.currency_code}`)
      }
    }
    
    console.log('   XOF (West African CFA) countries:')
    for (const code of cfaXofCountries) {
      const { data: country } = await supabase
        .from('countries')
        .select('name, code, currency_code')
        .eq('code', code)
        .is('user_id', null)
        .single()
      
      if (country) {
        const status = country.currency_code === 'XOF' ? '✅' : '❌'
        console.log(`   ${status} ${country.name} (${country.code}) -> ${country.currency_code}`)
      }
    }
    
    console.log('\n🎉 Currency mapping fixes complete!')
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  }
}

fixRemainingCurrencyMappings() 