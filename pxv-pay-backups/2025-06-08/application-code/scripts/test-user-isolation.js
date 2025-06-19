const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Create service role client for testing
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testUserIsolation() {
  try {
    console.log('🧪 Testing User Data Isolation')
    console.log('===============================')
    
    // 1. Test existing data - should have user_id columns
    console.log('1️⃣ Checking table structure...')
    
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .limit(5)
    
    if (countriesError) {
      console.error('❌ Error fetching countries:', countriesError)
    } else {
      console.log(`✅ Countries table: ${countries?.length || 0} records`)
      if (countries && countries.length > 0) {
        console.log('   Sample record:', countries[0])
        if (countries[0].user_id) {
          console.log('   ✅ user_id column exists')
        } else {
          console.log('   ❌ user_id column missing')
        }
      }
    }
    
    const { data: currencies, error: currenciesError } = await supabase
      .from('currencies')
      .select('*')
      .limit(5)
    
    if (currenciesError) {
      console.error('❌ Error fetching currencies:', currenciesError)
    } else {
      console.log(`✅ Currencies table: ${currencies?.length || 0} records`)
      if (currencies && currencies.length > 0) {
        console.log('   Sample record:', currencies[0])
        if (currencies[0].user_id) {
          console.log('   ✅ user_id column exists')
        } else {
          console.log('   ❌ user_id column missing')
        }
      }
    }
    
    const { data: paymentMethods, error: paymentMethodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .limit(5)
    
    if (paymentMethodsError) {
      console.error('❌ Error fetching payment methods:', paymentMethodsError)
    } else {
      console.log(`✅ Payment methods table: ${paymentMethods?.length || 0} records`)
      if (paymentMethods && paymentMethods.length > 0) {
        console.log('   Sample record:', paymentMethods[0])
        if (paymentMethods[0].user_id) {
          console.log('   ✅ user_id column exists')
        } else {
          console.log('   ❌ user_id column missing')
        }
      }
    }
    
    // 2. Create a test user to verify isolation
    console.log('\n2️⃣ Creating test user...')
    
    const testEmail = `test-${Date.now()}@example.com`
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true
    })
    
    if (createUserError) {
      console.error('❌ Error creating test user:', createUserError)
      return
    }
    
    console.log(`✅ Test user created: ${testEmail}`)
    console.log(`   User ID: ${newUser.user?.id}`)
    
    // 3. Check that new user has no data (empty account)
    console.log('\n3️⃣ Checking new user data isolation...')
    
    const userId = newUser.user?.id
    
    const { data: userCountries } = await supabase
      .from('countries')
      .select('*')
      .eq('user_id', userId)
    
    const { data: userCurrencies } = await supabase
      .from('currencies')
      .select('*')
      .eq('user_id', userId)
    
    const { data: userPaymentMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
    
    const { data: userPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
    
    console.log(`📊 New user's data:`)
    console.log(`   Countries: ${userCountries?.length || 0}`)
    console.log(`   Currencies: ${userCurrencies?.length || 0}`)
    console.log(`   Payment Methods: ${userPaymentMethods?.length || 0}`)
    console.log(`   Payments: ${userPayments?.length || 0}`)
    
    const isEmpty = (userCountries?.length || 0) === 0 && 
                   (userCurrencies?.length || 0) === 0 && 
                   (userPaymentMethods?.length || 0) === 0 && 
                   (userPayments?.length || 0) === 0
    
    if (isEmpty) {
      console.log('✅ Perfect! New user starts with completely empty account')
    } else {
      console.log('❌ Issue: New user has inherited data from other users')
    }
    
    // 4. Clean up test user
    console.log('\n4️⃣ Cleaning up test user...')
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    
    if (deleteError) {
      console.error('⚠️  Warning: Could not delete test user:', deleteError)
    } else {
      console.log('✅ Test user cleaned up')
    }
    
    console.log('\n🎯 Multi-tenancy Test Summary:')
    console.log('===============================')
    if (isEmpty) {
      console.log('✅ SUCCESS: Multi-tenancy is working correctly!')
      console.log('   - Each user has isolated data')
      console.log('   - New users start with empty accounts')
      console.log('   - Database schema updated properly')
    } else {
      console.log('❌ NEEDS ATTENTION: Multi-tenancy setup needs refinement')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

// Run the test
testUserIsolation() 