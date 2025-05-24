const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
// Use service role key for admin operations
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabaseKey = SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestPayment() {
  console.log('Creating a test payment...')
  
  try {
    // First check if we have any users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('No users found. Please sign up first at http://localhost:3000')
      return
    }
    
    const user = users[0]
    console.log('Creating payment for user:', user.email)
    
    // Create a test payment
    const testPayment = {
      user_id: user.id,
      amount: 150.75,
      currency: 'USD',
      payment_method: 'Bank Transfer',
      status: 'pending',
      country: 'US',
      description: 'Test payment for subscription service',
      metadata: {
        test: true,
        created_by: 'test-script'
      }
    }
    
    const { data, error } = await supabase
      .from('payments')
      .insert([testPayment])
      .select()
    
    if (error) {
      console.error('Error creating payment:', error)
      return
    }
    
    console.log('✅ Test payment created successfully:', {
      id: data[0].id,
      amount: `$${data[0].amount}`,
      status: data[0].status,
      user_id: data[0].user_id
    })
    
    console.log('\n🎉 You can now view this payment at:')
    console.log('   - Dashboard: http://localhost:3000/dashboard')
    console.log('   - Verification: http://localhost:3000/verification')
    console.log('\n📋 The payment is in "pending" status and can be approved/rejected from the verification page.')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestPayment() 