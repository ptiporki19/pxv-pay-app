const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEnhancedPaymentMethods() {
  console.log('🧪 Testing Enhanced Payment Methods System...\n')
  
  try {
    // 1. Test table structure
    console.log('1️⃣ Testing table structure...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'payment_methods')
      .eq('table_schema', 'public')
    
    if (columnsError) {
      console.log('⚠️  Could not query table structure:', columnsError.message)
    } else {
      console.log('✅ Payment methods table structure:')
      columns?.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
    }
    
    // 2. Test manual payment method creation
    console.log('\n2️⃣ Testing manual payment method creation...')
    
    const manualPaymentMethod = {
      name: 'Bank Transfer (Test)',
      type: 'manual',
      description: 'Test manual payment method with custom fields',
      countries: ['US', 'CA'],
      status: 'active',
      instructions: 'Please fill in all the required fields below.',
      custom_fields: [
        {
          id: 'field_1',
          label: 'Account Number',
          type: 'text',
          placeholder: 'Enter your account number',
          required: true,
          value: ''
        },
        {
          id: 'field_2',
          label: 'Routing Number',
          type: 'number',
          placeholder: 'Enter routing number',
          required: true,
          value: ''
        },
        {
          id: 'field_3',
          label: 'Account Holder Name',
          type: 'text',
          placeholder: 'Full name on account',
          required: true,
          value: ''
        }
      ]
    }
    
    const { data: manualData, error: manualError } = await supabase
      .from('payment_methods')
      .insert([manualPaymentMethod])
      .select()
    
    if (manualError) {
      console.log('❌ Manual payment method creation failed:', manualError.message)
    } else {
      console.log('✅ Manual payment method created successfully:', manualData[0]?.name)
      console.log(`   - Custom fields: ${manualData[0]?.custom_fields?.length || 0}`)
    }
    
    // 3. Test payment link method creation
    console.log('\n3️⃣ Testing payment link method creation...')
    
    const paymentLinkMethod = {
      name: 'PayPal Checkout',
      type: 'payment-link',
      description: 'External PayPal payment link',
      countries: ['Global'],
      status: 'active',
      url: 'https://paypal.me/testlink',
      instructions: 'Click the link to complete payment via PayPal.'
    }
    
    const { data: linkData, error: linkError } = await supabase
      .from('payment_methods')
      .insert([paymentLinkMethod])
      .select()
    
    if (linkError) {
      console.log('❌ Payment link method creation failed:', linkError.message)
    } else {
      console.log('✅ Payment link method created successfully:', linkData[0]?.name)
      console.log(`   - URL: ${linkData[0]?.url}`)
    }
    
    // 4. Test fetching all payment methods
    console.log('\n4️⃣ Testing payment methods retrieval...')
    
    const { data: allMethods, error: fetchError } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.log('❌ Failed to fetch payment methods:', fetchError.message)
    } else {
      console.log(`✅ Retrieved ${allMethods?.length || 0} payment methods:`)
      allMethods?.forEach((method, index) => {
        console.log(`   ${index + 1}. ${method.name} (${method.type})`)
        if (method.type === 'manual' && method.custom_fields) {
          console.log(`      - Custom fields: ${method.custom_fields.length}`)
        }
        if (method.type === 'payment-link' && method.url) {
          console.log(`      - URL: ${method.url}`)
        }
      })
    }
    
    // 5. Test type constraints
    console.log('\n5️⃣ Testing type constraints...')
    
    const invalidMethod = {
      name: 'Invalid Method',
      type: 'invalid-type',
      countries: ['US'],
      status: 'active'
    }
    
    const { error: constraintError } = await supabase
      .from('payment_methods')
      .insert([invalidMethod])
    
    if (constraintError) {
      console.log('✅ Type constraint working correctly:', constraintError.message)
    } else {
      console.log('❌ Type constraint not working - invalid type was accepted')
    }
    
    // 6. Test URL constraint for payment links
    console.log('\n6️⃣ Testing URL constraint for payment links...')
    
    const invalidLinkMethod = {
      name: 'Invalid Link Method',
      type: 'payment-link',
      countries: ['US'],
      status: 'active'
      // Missing URL
    }
    
    const { error: urlConstraintError } = await supabase
      .from('payment_methods')
      .insert([invalidLinkMethod])
    
    if (urlConstraintError) {
      console.log('✅ URL constraint working correctly:', urlConstraintError.message)
    } else {
      console.log('❌ URL constraint not working - payment-link without URL was accepted')
    }
    
    // 7. Clean up test data
    console.log('\n7️⃣ Cleaning up test data...')
    
    const { error: cleanupError } = await supabase
      .from('payment_methods')
      .delete()
      .in('name', ['Bank Transfer (Test)', 'PayPal Checkout'])
    
    if (cleanupError) {
      console.log('⚠️  Cleanup warning:', cleanupError.message)
    } else {
      console.log('✅ Test data cleaned up successfully')
    }
    
    console.log('\n🎉 Enhanced Payment Methods System Test Complete!')
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

testEnhancedPaymentMethods() 