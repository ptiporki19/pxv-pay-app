const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestUser() {
  console.log('🧪 Creating test user for profile testing...\n')
  
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'testuser@example.com',
      password: 'testpassword123',
      email_confirm: true
    })
    
    if (authError) {
      console.log('❌ Failed to create auth user:', authError.message)
      return
    }
    
    console.log('✅ Auth user created:', authData.user.id)
    
    // Create user in public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'testuser@example.com',
        role: 'registered_user',
        active: true
      })
      .select()
      .single()
    
    if (userError) {
      console.log('❌ Failed to create user profile:', userError.message)
      return
    }
    
    console.log('✅ User profile created')
    
    // Create some sample data for the user
    
    // Sample currencies
    const { data: currencies, error: currencyError } = await supabase
      .from('currencies')
      .insert([
        {
          user_id: authData.user.id,
          name: 'US Dollar',
          code: 'USD',
          symbol: '$',
          status: 'active'
        },
        {
          user_id: authData.user.id,
          name: 'Euro',
          code: 'EUR',
          symbol: '€',
          status: 'active'
        }
      ])
      .select()
    
    if (currencyError) {
      console.log('⚠️ Failed to create currencies:', currencyError.message)
    } else {
      console.log('✅ Sample currencies created:', currencies.length)
    }
    
    // Sample countries
    const { data: countries, error: countryError } = await supabase
      .from('countries')
      .insert([
        {
          user_id: authData.user.id,
          name: 'United States',
          code: 'US',
          status: 'active'
        },
        {
          user_id: authData.user.id,
          name: 'Germany',
          code: 'DE',
          status: 'active'
        }
      ])
      .select()
    
    if (countryError) {
      console.log('⚠️ Failed to create countries:', countryError.message)
    } else {
      console.log('✅ Sample countries created:', countries.length)
    }
    
    // Sample payment methods
    const { data: paymentMethods, error: pmError } = await supabase
      .from('payment_methods')
      .insert([
        {
          user_id: authData.user.id,
          name: 'Credit Card',
          type: 'card',
          status: 'active',
          countries: ['US', 'DE']
        },
        {
          user_id: authData.user.id,
          name: 'PayPal',
          type: 'wallet',
          status: 'active',
          countries: ['US']
        }
      ])
      .select()
    
    if (pmError) {
      console.log('⚠️ Failed to create payment methods:', pmError.message)
    } else {
      console.log('✅ Sample payment methods created:', paymentMethods.length)
    }
    
    // Sample payments
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          user_id: authData.user.id,
          amount: 100.00,
          currency: 'USD',
          payment_method: 'Credit Card',
          status: 'completed',
          country: 'US',
          description: 'Test payment 1'
        },
        {
          user_id: authData.user.id,
          amount: 50.00,
          currency: 'EUR',
          payment_method: 'PayPal',
          status: 'pending',
          country: 'DE',
          description: 'Test payment 2'
        },
        {
          user_id: authData.user.id,
          amount: 25.00,
          currency: 'USD',
          payment_method: 'Credit Card',
          status: 'failed',
          country: 'US',
          description: 'Test payment 3'
        }
      ])
      .select()
    
    if (paymentError) {
      console.log('⚠️ Failed to create payments:', paymentError.message)
    } else {
      console.log('✅ Sample payments created:', payments.length)
    }
    
    console.log('\n🎉 Test user created successfully!')
    console.log(`📧 Email: testuser@example.com`)
    console.log(`🔑 Password: testpassword123`)
    console.log(`👤 User ID: ${authData.user.id}`)
    console.log(`\n🔗 Profile URL: http://localhost:3002/users/${authData.user.id}/profile`)
    
  } catch (error) {
    console.error('💥 Error creating test user:', error)
  }
}

createTestUser()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 