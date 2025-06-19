const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function testDuplicateCountry() {
  console.log('🧪 Testing Duplicate Country Error Handling...\n')
  
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
    
    console.log(`✅ Admin user: ${adminUser.email}`)
    
    // Try to create a country with a duplicate code (US already exists)
    console.log('\n🧪 Testing duplicate country code (US)...')
    
    const duplicateCountry = {
      name: 'United States of America',
      code: 'US',
      user_id: adminUser.id,
      status: 'active'
    }
    
    const { data, error } = await supabase
      .from('countries')
      .insert([duplicateCountry])
      .select()
      .single()
    
    if (error) {
      console.log('✅ Expected error occurred:')
      console.log(`   Error code: ${error.code}`)
      console.log(`   Error message: ${error.message}`)
      
      // Check if it's the expected duplicate key error
      if (error.code === '23505') {
        console.log('✅ Correct error type: Unique constraint violation')
        if (error.message.includes('countries_code_key')) {
          console.log('✅ Correct constraint: countries_code_key')
        }
      }
    } else {
      console.log('❌ Unexpected success - duplicate should have failed')
      console.log('   Created country:', data)
    }
    
    console.log('\n📋 Test completed!')
    console.log('   The frontend should now show a user-friendly error message')
    console.log('   instead of the raw database error.')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDuplicateCountry() 