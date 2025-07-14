const { createClient } = require('@supabase/supabase-js')

// Use production credentials directly
const supabaseUrl = 'https://frdksqjaiuakkalebnzd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1MTg3OCwiZXhwIjoyMDY0ODI3ODc4fQ.5QbOP4VAu_PlPKC-npRL9XCCzWhnv1l_ldkEx_OcrP4'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testProductionAnalytics() {
  console.log('🧪 Production Analytics Test\n')

  try {
    // Test 1: Check users table
    console.log('1️⃣ Testing Users Table:')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, active')
      .limit(10)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
    } else {
      console.log(`   ✅ Found ${users.length} users`)
      users.forEach(user => {
        console.log(`     - ${user.email} (${user.role}) ${user.active ? '✅' : '❌'}`)
      })
    }

    // Test 2: Check payments table
    console.log('\n2️⃣ Testing Payments Table:')
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, country, currency, amount, status, merchant_id, created_at')
      .limit(20)

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError.message)
    } else {
      console.log(`   ✅ Found ${payments.length} payments`)
      
      if (payments.length > 0) {
        // Show sample payment
        console.log('\n   📋 Sample Payment:')
        const sample = payments[0]
        Object.keys(sample).forEach(key => {
          console.log(`     ${key}: ${sample[key]}`)
        })

        // Currency analysis
        const currencies = new Set(payments.map(p => p.currency).filter(Boolean))
        const countries = new Set(payments.map(p => p.country).filter(Boolean))
        
        console.log(`\n   💰 Currencies: ${Array.from(currencies).join(', ')}`)
        console.log(`   🌍 Countries: ${Array.from(countries).join(', ')}`)

        // Check for null values
        const nullCurrency = payments.filter(p => !p.currency).length
        const nullCountry = payments.filter(p => !p.country).length
        
        console.log(`   ⚠️  Null currency: ${nullCurrency}`)
        console.log(`   ⚠️  Null country: ${nullCountry}`)
      }
    }

    // Test 3: Test specific user data (afriglobalimports@gmail.com)
    console.log('\n3️⃣ Testing Specific User Data:')
    const { data: specificUser, error: userError } = await supabase
      .from('users')
      .select('id, email, role, active')
      .eq('email', 'afriglobalimports@gmail.com')
      .single()

    if (userError) {
      console.log('   ❌ User not found or error:', userError.message)
    } else {
      console.log(`   ✅ Found user: ${specificUser.email}`)
      console.log(`   🎭 Role: ${specificUser.role}`)
      console.log(`   🔑 ID: ${specificUser.id}`)

      // Get payments for this user
      const { data: userPayments, error: userPaymentsError } = await supabase
        .from('payments')
        .select('id, country, currency, amount, status, created_at')
        .eq('merchant_id', specificUser.id)

      if (userPaymentsError) {
        console.log('   ❌ Error fetching user payments:', userPaymentsError.message)
      } else {
        console.log(`   💳 User payments: ${userPayments.length}`)
        
        if (userPayments.length > 0) {
          // Geographic analytics for this user
          const countryStats = new Map()
          userPayments.forEach(payment => {
            if (!payment.country) return
            
            const existing = countryStats.get(payment.country) || {
              totalRevenue: 0,
              paymentCount: 0,
              currency: payment.currency || 'USD'
            }

            existing.totalRevenue += parseFloat(payment.amount?.toString() || '0')
            existing.paymentCount += 1
            countryStats.set(payment.country, existing)
          })

          console.log('\n   📊 User Geographic Analytics:')
          Array.from(countryStats.entries())
            .sort(([,a], [,b]) => b.totalRevenue - a.totalRevenue)
            .forEach(([country, stats]) => {
              console.log(`     ${country}: ${stats.currency} ${stats.totalRevenue.toLocaleString()} (${stats.paymentCount} payments)`)
            })
        }
      }
    }

    console.log('\n✅ Production test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

testProductionAnalytics() 