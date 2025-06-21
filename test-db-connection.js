const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function testConnection() {
  console.log('🔗 Testing Database Connection...\n')
  
  try {
    // Test basic connection
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .limit(5)
    
    if (countriesError) {
      console.log('❌ Countries query failed:', countriesError.message)
    } else {
      console.log(`✅ Countries query successful: ${countries.length} records`)
    }
    
    // Test checkout links
    const { data: checkoutLinks, error: linksError } = await supabase
      .from('checkout_links')
      .select('*')
    
    if (linksError) {
      console.log('❌ Checkout links query failed:', linksError.message)
    } else {
      console.log(`✅ Checkout links query successful: ${checkoutLinks.length} records`)
      if (checkoutLinks.length > 0) {
        console.log('   First link:', checkoutLinks[0].slug)
      }
    }
    
    // Test specific checkout link
    const { data: specificLink, error: specificError } = await supabase
      .from('checkout_links')
      .select('*')
      .eq('slug', 'test-checkout-1748250459309')
      .single()
    
    if (specificError) {
      console.log('❌ Specific checkout link query failed:', specificError.message)
    } else {
      console.log('✅ Specific checkout link found:', specificLink.link_name)
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
  }
}

testConnection().then(() => process.exit(0))