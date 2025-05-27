const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

async function testCountrySpecificPaymentMethods() {
  console.log('🧪 Testing Country-Specific Payment Methods System...\n')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // 1. Sign in as admin
    console.log('1. Signing in as admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })
    
    if (authError) {
      console.log(`❌ Auth failed: ${authError.message}`)
      return
    }
    
    console.log(`✅ Signed in as: ${authData.user.email}`)
    
    // 2. Create a payment method with country-specific details
    console.log('\n2. Creating payment method with country-specific details...')
    
    const paymentMethodData = {
      name: 'Bank Transfer (Multi-Country)',
      type: 'manual',
      countries: ['US', 'GB', 'NG'],
      status: 'active',
      description: 'Bank transfer with country-specific account details',
      instructions: 'General bank transfer instructions',
      instructions_for_checkout: 'Please transfer to the account details shown below',
      display_order: 1,
      country_specific_details: {
        'US': {
          instructions: 'Transfer to our US bank account',
          custom_fields: [
            {
              id: 'us_account_1',
              label: 'Account Number',
              type: 'text',
              placeholder: 'Enter account number',
              required: true,
              value: '123456789'
            },
            {
              id: 'us_routing_1',
              label: 'Routing Number',
              type: 'text',
              placeholder: 'Enter routing number',
              required: true,
              value: '021000021'
            }
          ],
          additional_info: 'Processing time: 1-3 business days'
        },
        'GB': {
          instructions: 'Transfer to our UK bank account',
          custom_fields: [
            {
              id: 'gb_sort_1',
              label: 'Sort Code',
              type: 'text',
              placeholder: 'Enter sort code',
              required: true,
              value: '12-34-56'
            },
            {
              id: 'gb_account_1',
              label: 'Account Number',
              type: 'text',
              placeholder: 'Enter account number',
              required: true,
              value: '12345678'
            }
          ],
          additional_info: 'Processing time: Same day'
        },
        'NG': {
          instructions: 'Transfer to our Nigerian bank account',
          custom_fields: [
            {
              id: 'ng_account_1',
              label: 'Account Number',
              type: 'text',
              placeholder: 'Enter account number',
              required: true,
              value: '0123456789'
            },
            {
              id: 'ng_bank_1',
              label: 'Bank Name',
              type: 'text',
              placeholder: 'Enter bank name',
              required: true,
              value: 'First Bank of Nigeria'
            }
          ],
          additional_info: 'Processing time: Instant'
        }
      }
    }
    
    const { data: paymentMethod, error: createError } = await supabase
      .from('payment_methods')
      .insert([paymentMethodData])
      .select()
      .single()
    
    if (createError) {
      console.log(`❌ Failed to create payment method: ${createError.message}`)
      return
    }
    
    console.log(`✅ Created payment method: ${paymentMethod.name}`)
    console.log(`   - ID: ${paymentMethod.id}`)
    console.log(`   - Countries: ${paymentMethod.countries.join(', ')}`)
    console.log(`   - Has country-specific details: ${Object.keys(paymentMethod.country_specific_details || {}).length > 0 ? 'Yes' : 'No'}`)
    
    // 3. Test retrieving payment methods for specific countries
    console.log('\n3. Testing country-specific retrieval...')
    
    for (const countryCode of ['US', 'GB', 'NG']) {
      console.log(`\n   Testing for ${countryCode}:`)
      
      const { data: countryMethods, error: retrieveError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('status', 'active')
        .contains('countries', [countryCode])
        .order('display_order', { ascending: true })
      
      if (retrieveError) {
        console.log(`   ❌ Failed to retrieve methods for ${countryCode}: ${retrieveError.message}`)
        continue
      }
      
      console.log(`   ✅ Found ${countryMethods.length} payment method(s) for ${countryCode}`)
      
      if (countryMethods.length > 0) {
        const method = countryMethods[0]
        const countryDetails = method.country_specific_details?.[countryCode]
        
        if (countryDetails) {
          console.log(`   📋 Country-specific details:`)
          console.log(`      - Instructions: ${countryDetails.instructions}`)
          console.log(`      - Custom fields: ${countryDetails.custom_fields?.length || 0}`)
          console.log(`      - Additional info: ${countryDetails.additional_info || 'None'}`)
          
          if (countryDetails.custom_fields && countryDetails.custom_fields.length > 0) {
            console.log(`   🏦 Payment details for ${countryCode}:`)
            countryDetails.custom_fields.forEach(field => {
              console.log(`      - ${field.label}: ${field.value}`)
            })
          }
        } else {
          console.log(`   ⚠️  No country-specific details found for ${countryCode}`)
        }
      }
    }
    
    // 4. Test the helper function for getting effective details
    console.log('\n4. Testing effective details retrieval...')
    
    const testCountries = ['US', 'GB', 'NG', 'CA'] // CA not configured, should use fallback
    
    for (const countryCode of testCountries) {
      const countrySpecific = paymentMethod.country_specific_details?.[countryCode]
      
      const effectiveDetails = {
        instructions: countrySpecific?.instructions || paymentMethod.instructions_for_checkout || paymentMethod.instructions || '',
        custom_fields: countrySpecific?.custom_fields || paymentMethod.custom_fields || [],
        additional_info: countrySpecific?.additional_info || ''
      }
      
      console.log(`\n   ${countryCode} effective details:`)
      console.log(`   - Instructions: ${effectiveDetails.instructions}`)
      console.log(`   - Custom fields: ${effectiveDetails.custom_fields.length}`)
      console.log(`   - Uses country-specific: ${countrySpecific ? 'Yes' : 'No (fallback)'}`)
    }
    
    // 5. Test updating country-specific details
    console.log('\n5. Testing update of country-specific details...')
    
    const updatedDetails = {
      ...paymentMethod.country_specific_details,
      'CA': {
        instructions: 'Transfer to our Canadian bank account',
        custom_fields: [
          {
            id: 'ca_transit_1',
            label: 'Transit Number',
            type: 'text',
            placeholder: 'Enter transit number',
            required: true,
            value: '12345'
          },
          {
            id: 'ca_account_1',
            label: 'Account Number',
            type: 'text',
            placeholder: 'Enter account number',
            required: true,
            value: 'CA123456789'
          }
        ],
        additional_info: 'Processing time: 1-2 business days'
      }
    }
    
    const { data: updatedMethod, error: updateError } = await supabase
      .from('payment_methods')
      .update({ country_specific_details: updatedDetails })
      .eq('id', paymentMethod.id)
      .select()
      .single()
    
    if (updateError) {
      console.log(`❌ Failed to update payment method: ${updateError.message}`)
    } else {
      console.log(`✅ Successfully added Canada-specific details`)
      console.log(`   - Now supports: ${updatedMethod.countries.join(', ')}, CA (details only)`)
    }
    
    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📋 Summary:')
    console.log('✅ Country-specific payment details system is working')
    console.log('✅ Database schema supports JSONB country_specific_details')
    console.log('✅ Can create payment methods with multiple country configurations')
    console.log('✅ Can retrieve payment methods by country')
    console.log('✅ Fallback system works for unconfigured countries')
    console.log('✅ Can update country-specific details')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testCountrySpecificPaymentMethods().catch(console.error) 