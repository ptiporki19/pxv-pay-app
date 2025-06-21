const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addTestData() {
  console.log('Adding test payment methods...')
  
  const testPaymentMethods = [
    {
      name: 'Bank Transfer (USD)',
      type: 'bank',
      countries: ['US', 'CA'],
      status: 'active',
      instructions: 'Transfer funds to our bank account using the provided details.'
    },
    {
      name: 'PayPal Payment Link',
      type: 'payment-link',
      countries: ['Global'],
      status: 'active',
      url: 'https://paypal.me/example',
      instructions: 'Click the link to pay securely through PayPal.'
    },
    {
      name: 'M-Pesa Mobile Money',
      type: 'mobile',
      countries: ['KE'],
      status: 'active',
      instructions: 'Use M-Pesa to send payment to our business number.'
    },
    {
      name: 'Bitcoin Payment',
      type: 'crypto',
      countries: ['Global'],
      status: 'pending',
      instructions: 'Send Bitcoin to the provided wallet address.'
    }
  ]
  
  try {
    for (const method of testPaymentMethods) {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([method])
        .select()
      
      if (error) {
        console.error(`Error adding ${method.name}:`, error.message)
      } else {
        console.log(`✅ Added ${method.name}`)
      }
    }
    
    console.log('\nTest data added successfully!')
    
    // Verify the data was added
    const { data: allMethods, error: fetchError } = await supabase
      .from('payment_methods')
      .select('*')
    
    if (fetchError) {
      console.error('Error fetching payment methods:', fetchError)
    } else {
      console.log(`\n📊 Total payment methods in database: ${allMethods?.length || 0}`)
      allMethods?.forEach(method => {
        console.log(`   - ${method.name} (${method.type}) - ${method.status}`)
      })
    }
    
  } catch (error) {
    console.error('Error adding test data:', error)
  }
}

addTestData() 