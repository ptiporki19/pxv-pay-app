const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function checkExistingCountries() {
  console.log('🔍 Checking Existing Countries...\n')
  
  try {
    const { data: countries, error } = await supabase
      .from('countries')
      .select('code, name, user_id')
      .order('code')
    
    if (error) {
      console.log(`❌ Error fetching countries: ${error.message}`)
      return
    }
    
    console.log('Existing country codes:')
    countries?.forEach(c => {
      console.log(`  ${c.code} - ${c.name} (user_id: ${c.user_id})`)
    })
    
    console.log(`\nTotal countries: ${countries?.length || 0}`)
    
  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkExistingCountries() 