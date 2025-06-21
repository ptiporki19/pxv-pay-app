const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function cleanOrphanedCountries() {
  console.log('🧹 Cleaning Orphaned Countries...\n')
  
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
    
    // Get all countries
    const { data: allCountries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .order('code')
    
    if (countriesError) {
      console.log(`❌ Countries fetch failed: ${countriesError.message}`)
      return
    }
    
    console.log('\n📍 Current countries:')
    allCountries?.forEach(c => {
      console.log(`  ${c.code} - ${c.name} (user_id: ${c.user_id || 'NULL'})`)
    })
    
    // Find orphaned countries (no user_id)
    const orphanedCountries = allCountries?.filter(c => !c.user_id) || []
    
    if (orphanedCountries.length > 0) {
      console.log(`\n🗑️ Found ${orphanedCountries.length} orphaned countries:`)
      orphanedCountries.forEach(c => {
        console.log(`  ${c.code} - ${c.name}`)
      })
      
      // Delete orphaned countries
      console.log('\n🗑️ Deleting orphaned countries...')
      for (const country of orphanedCountries) {
        const { error: deleteError } = await supabase
          .from('countries')
          .delete()
          .eq('id', country.id)
        
        if (deleteError) {
          console.log(`❌ Failed to delete ${country.code}: ${deleteError.message}`)
        } else {
          console.log(`✅ Deleted ${country.code} - ${country.name}`)
        }
      }
    } else {
      console.log('\n✅ No orphaned countries found')
    }
    
    // Check for duplicates by code
    const countryCodeCounts = {}
    allCountries?.forEach(c => {
      if (c.user_id) { // Only count countries that belong to users
        countryCodeCounts[c.code] = (countryCodeCounts[c.code] || 0) + 1
      }
    })
    
    const duplicateCodes = Object.entries(countryCodeCounts).filter(([code, count]) => count > 1)
    
    if (duplicateCodes.length > 0) {
      console.log(`\n⚠️ Found duplicate country codes:`)
      duplicateCodes.forEach(([code, count]) => {
        console.log(`  ${code}: ${count} entries`)
      })
    } else {
      console.log('\n✅ No duplicate country codes found')
    }
    
    // Final check
    console.log('\n🔍 Final country list:')
    const { data: finalCountries, error: finalError } = await supabase
      .from('countries')
      .select('*')
      .order('code')
    
    if (finalError) {
      console.log(`❌ Final check failed: ${finalError.message}`)
    } else {
      finalCountries?.forEach(c => {
        console.log(`  ${c.code} - ${c.name} (user_id: ${c.user_id})`)
      })
      console.log(`\nTotal countries: ${finalCountries?.length || 0}`)
    }
    
    console.log('\n🎉 Cleanup completed!')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message)
  }
}

cleanOrphanedCountries() 