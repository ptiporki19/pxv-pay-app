const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zzxrlugvqkmglvwwqqrv.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eHJsdWd2cWttZ2x2d3dxcXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjI0MzE0MCwiZXhwIjoyMDQxODE5MTQwfQ.IwE1BwrJKEa8z_QQLlxSDOI8YLHVdRTqfpfLy6fHj2Q'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDashboardPaymentHistory() {
  console.log('🧪 Testing Dashboard Payment History...')
  
  try {
    // Find our test merchant user
    const { data: merchant } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'afriglobalimports@gmail.com')
      .single()
    
    if (!merchant) {
      console.log('❌ Test merchant not found')
      return
    }
    
    console.log(`✅ Found merchant: ${merchant.email} (ID: ${merchant.id})`)
    
    // Fetch payments for this merchant (same logic as dashboard)
    const { data: merchantPayments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.log('❌ Error fetching merchant payments:', error.message)
      return
    }
    
    console.log(`\n📊 Merchant Payment History (Last 10):`)
    console.log(`Found ${merchantPayments?.length || 0} payments for merchant\n`)
    
    if (merchantPayments && merchantPayments.length > 0) {
      merchantPayments.forEach((payment, index) => {
        const formattedDate = new Date(payment.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
        
        console.log(`${index + 1}. Transaction ID: ${payment.id.slice(0, 8)}...`)
        console.log(`   Date: ${formattedDate}`)
        console.log(`   Customer: ${payment.customer_name || payment.customer_email?.split('@')[0] || 'N/A'}`)
        console.log(`   Email: ${payment.customer_email || 'N/A'}`)
        console.log(`   Amount: ${payment.amount} ${payment.currency || 'USD'}`)
        console.log(`   Method: ${payment.payment_method || 'N/A'}`)
        console.log(`   Country: ${payment.country || 'N/A'}`)
        console.log(`   Status: ${payment.status || 'pending'}`)
        console.log('')
      })
    } else {
      console.log('No payments found for this merchant.')
    }
    
    // Also test super admin view to compare
    console.log('🔄 Testing Super Admin View (All Payments):')
    
    const { data: allPayments } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    console.log(`Found ${allPayments?.length || 0} total payments across all merchants\n`)
    
    if (allPayments && allPayments.length > 0) {
      allPayments.forEach((payment, index) => {
        console.log(`${index + 1}. ${payment.id.slice(0, 8)}... - ${payment.customer_name || 'Customer'} - $${payment.amount} - ${payment.status}`)
      })
    }
    
    // Test the formatting logic
    console.log('\n🎨 Testing Payment Formatting:')
    if (merchantPayments && merchantPayments.length > 0) {
      const samplePayment = merchantPayments[0]
      const formatted = {
        id: samplePayment.id || 'N/A',
        fullId: samplePayment.id || 'N/A',
        date: samplePayment.created_at ? new Date(samplePayment.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A',
        customer: samplePayment.customer_name || samplePayment.customer_email?.split('@')[0] || 'N/A',
        customerEmail: samplePayment.customer_email || '',
        amount: samplePayment.amount && samplePayment.currency ? samplePayment.amount : 0,
        currency: samplePayment.currency || 'USD',
        method: samplePayment.payment_method || 'N/A',
        country: samplePayment.country || 'N/A',
        status: samplePayment.status || 'pending'
      }
      
      console.log('Sample formatted payment object:')
      console.log(JSON.stringify(formatted, null, 2))
    }
    
    console.log('\n✅ Dashboard payment history test completed!')
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testDashboardPaymentHistory() 