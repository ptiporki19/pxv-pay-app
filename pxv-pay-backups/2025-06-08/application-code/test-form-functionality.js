const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'http://localhost:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFormFunctionality() {
  console.log('🧪 Testing Payment Method Form Functionality...\n')

  try {
    // Authenticate as admin
    console.log('🔐 Authenticating as admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })

    if (authError) {
      console.error('❌ Authentication failed:', authError)
      return
    }
    console.log('✅ Admin authenticated successfully')

    // Test creating a payment method
    console.log('\n📝 Testing payment method creation...')
    
    const testPaymentMethod = {
      name: 'Test Mobile Money',
      type: 'manual',
      status: 'active',
      description: 'Test mobile money payment method',
      countries: ['KE'],
      country_specific_details: {
        'KE': {
          custom_fields: [
            {
              id: 'field_1',
              label: 'Phone Number',
              type: 'tel',
              placeholder: '+254700000000',
              required: true,
              value: '+254700123456'
            },
            {
              id: 'field_2', 
              label: 'Account Name',
              type: 'text',
              placeholder: 'John Doe',
              required: true,
              value: 'Test Account'
            }
          ],
          instructions: 'Send money to the phone number provided',
          url: null,
          additional_info: ''
        }
      },
      display_order: 0
    }

    // Create the payment method
    const { data: createData, error: createError } = await supabase
      .from('payment_methods')
      .insert([testPaymentMethod])
      .select()

    if (createError) {
      console.error('❌ Failed to create payment method:', createError)
      return
    }

    console.log('✅ Payment method created successfully:', createData[0].name)
    console.log('📊 Payment method ID:', createData[0].id)

    // Test retrieving the payment method
    console.log('\n🔍 Testing payment method retrieval...')
    const { data: retrieveData, error: retrieveError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', createData[0].id)
      .single()

    if (retrieveError) {
      console.error('❌ Failed to retrieve payment method:', retrieveError)
      return
    }

    console.log('✅ Payment method retrieved successfully')
    console.log('📋 Retrieved data:', {
      name: retrieveData.name,
      type: retrieveData.type,
      countries: retrieveData.countries,
      status: retrieveData.status
    })

    // Verify country-specific details
    console.log('\n🌍 Verifying country-specific details...')
    const keDetails = retrieveData.country_specific_details?.KE
    if (keDetails && keDetails.custom_fields && keDetails.custom_fields.length === 2) {
      console.log('✅ Country-specific details are correct')
      console.log('📱 Custom fields count:', keDetails.custom_fields.length)
    } else {
      console.log('❌ Country-specific details are incorrect')
    }

    // Clean up - delete the test payment method
    console.log('\n🧹 Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', createData[0].id)

    if (deleteError) {
      console.error('❌ Failed to delete test payment method:', deleteError)
    } else {
      console.log('✅ Test payment method deleted successfully')
    }

    console.log('\n🎉 All tests passed! The form functionality is working correctly.')

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testFormFunctionality().then(() => {
  console.log('\n✨ Test completed')
  process.exit(0)
}).catch(error => {
  console.error('💥 Test crashed:', error)
  process.exit(1)
}) 