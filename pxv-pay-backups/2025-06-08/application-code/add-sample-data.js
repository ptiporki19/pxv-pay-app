const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

const TEST_USER_ID = '703f0887-78f9-46d4-9a67-9bd21f2ec3ea'

async function addSampleData() {
  console.log('🧪 Adding sample data for test user...\n')
  
  try {
    // Add sample currencies
    const { data: currencies, error: currencyError } = await supabase
      .from('currencies')
      .upsert([
        {
          user_id: TEST_USER_ID,
          name: 'US Dollar',
          code: 'USD',
          symbol: '$',
          status: 'active'
        },
        {
          user_id: TEST_USER_ID,
          name: 'Euro',
          code: 'EUR',
          symbol: '€',
          status: 'active'
        },
        {
          user_id: TEST_USER_ID,
          name: 'British Pound',
          code: 'GBP',
          symbol: '£',
          status: 'inactive'
        }
      ])
      .select()
    
    if (currencyError) {
      console.log('⚠️ Currencies error:', currencyError.message)
    } else {
      console.log('✅ Sample currencies created:', currencies?.length || 0)
    }
    
    // Add sample countries
    const { data: countries, error: countryError } = await supabase
      .from('countries')
      .upsert([
        {
          user_id: TEST_USER_ID,
          name: 'United States',
          code: 'US',
          status: 'active'
        },
        {
          user_id: TEST_USER_ID,
          name: 'Germany',
          code: 'DE',
          status: 'active'
        },
        {
          user_id: TEST_USER_ID,
          name: 'United Kingdom',
          code: 'GB',
          status: 'active'
        },
        {
          user_id: TEST_USER_ID,
          name: 'France',
          code: 'FR',
          status: 'inactive'
        }
      ])
      .select()
    
    if (countryError) {
      console.log('⚠️ Countries error:', countryError.message)
    } else {
      console.log('✅ Sample countries created:', countries?.length || 0)
    }
    
    // Add sample payment methods
    const { data: paymentMethods, error: pmError } = await supabase
      .from('payment_methods')
      .upsert([
        {
          user_id: TEST_USER_ID,
          name: 'Credit Card',
          type: 'card',
          status: 'active',
          countries: ['US', 'DE', 'GB']
        },
        {
          user_id: TEST_USER_ID,
          name: 'PayPal',
          type: 'wallet',
          status: 'active',
          countries: ['US', 'DE']
        },
        {
          user_id: TEST_USER_ID,
          name: 'Bank Transfer',
          type: 'bank',
          status: 'inactive',
          countries: ['DE', 'GB']
        }
      ])
      .select()
    
    if (pmError) {
      console.log('⚠️ Payment methods error:', pmError.message)
    } else {
      console.log('✅ Sample payment methods created:', paymentMethods?.length || 0)
    }
    
    // Add sample payments
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .upsert([
        {
          user_id: TEST_USER_ID,
          amount: 150.00,
          currency: 'USD',
          payment_method: 'Credit Card',
          status: 'completed',
          country: 'US',
          description: 'Purchase - Premium Plan'
        },
        {
          user_id: TEST_USER_ID,
          amount: 75.50,
          currency: 'EUR',
          payment_method: 'PayPal',
          status: 'completed',
          country: 'DE',
          description: 'Subscription Renewal'
        },
        {
          user_id: TEST_USER_ID,
          amount: 200.00,
          currency: 'USD',
          payment_method: 'Credit Card',
          status: 'pending',
          country: 'US',
          description: 'Annual Subscription'
        },
        {
          user_id: TEST_USER_ID,
          amount: 45.00,
          currency: 'GBP',
          payment_method: 'Credit Card',
          status: 'failed',
          country: 'GB',
          description: 'Monthly Plan'
        },
        {
          user_id: TEST_USER_ID,
          amount: 99.99,
          currency: 'USD',
          payment_method: 'PayPal',
          status: 'completed',
          country: 'US',
          description: 'One-time Purchase'
        },
        {
          user_id: TEST_USER_ID,
          amount: 125.00,
          currency: 'EUR',
          payment_method: 'Credit Card',
          status: 'pending',
          country: 'DE',
          description: 'Service Upgrade'
        }
      ])
      .select()
    
    if (paymentError) {
      console.log('⚠️ Payments error:', paymentError.message)
    } else {
      console.log('✅ Sample payments created:', payments?.length || 0)
    }
    
    console.log('\n🎉 Sample data added successfully!')
    console.log(`🔗 Profile URL: http://localhost:3002/users/${TEST_USER_ID}/profile`)
    console.log('\n📊 Data Summary:')
    console.log(`- Currencies: ${currencies?.length || 0} (2 active, 1 inactive)`)
    console.log(`- Countries: ${countries?.length || 0} (3 active, 1 inactive)`)
    console.log(`- Payment Methods: ${paymentMethods?.length || 0} (2 active, 1 inactive)`)
    console.log(`- Payments: ${payments?.length || 0} (3 completed, 2 pending, 1 failed)`)
    
  } catch (error) {
    console.error('💥 Error adding sample data:', error)
  }
}

addSampleData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 