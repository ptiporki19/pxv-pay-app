const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../pxv-pay/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('URL:', supabaseUrl ? 'Present' : 'Missing')
  console.error('Key:', supabaseKey ? 'Present' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAnalyticsComprehensive() {
  console.log('🧪 Comprehensive Analytics Dashboard Test\n')

  try {
    // First, let's see what users exist
    console.log('0️⃣ Checking Available Users:')
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, role, active')
      .limit(10)

    if (allUsersError) {
      console.error('❌ Error fetching users:', allUsersError.message)
      return
    }

    console.log(`   ✅ Found ${allUsers.length} users in database:`)
    allUsers.forEach(user => {
      console.log(`     - ${user.email} (${user.role}) ${user.active ? '✅' : '❌'}`)
    })

    // Find a test user (prefer the one we've been using, or use the first active one)
    let testUser = allUsers.find(u => u.email === 'afriglobalimports@gmail.com')
    if (!testUser) {
      testUser = allUsers.find(u => u.active && u.role !== 'super_admin')
      if (!testUser) {
        testUser = allUsers[0]
      }
    }

    if (!testUser) {
      console.error('❌ No users found in database')
      return
    }

    console.log(`\n🎯 Testing with user: ${testUser.email}\n`)

    // Test 1: User Profile and Authentication
    console.log('1️⃣ Testing User Profile:')
    const userProfile = testUser

    console.log(`   ✅ User: ${userProfile.email}`)
    console.log(`   🎭 Role: ${userProfile.role}`)
    console.log(`   🔑 ID: ${userProfile.id}`)
    console.log(`   ✅ Active: ${userProfile.active}`)

    const isSuperAdmin = userProfile.role === 'super_admin' || 
      ['admin@pxvpay.com', 'dev-admin@pxvpay.com', 'superadmin@pxvpay.com'].includes(userProfile.email)
    console.log(`   👑 Super Admin: ${isSuperAdmin}`)

    // Test 2: Raw Payments Data
    console.log('\n2️⃣ Testing Raw Payments Data:')
    let paymentsQuery = supabase
      .from('payments')
      .select('id, country, currency, amount, status, merchant_id, created_at, customer_name, customer_email, payment_method')

    if (!isSuperAdmin) {
      paymentsQuery = paymentsQuery.eq('merchant_id', userProfile.id)
    }

    const { data: paymentsData, error: paymentsError } = await paymentsQuery

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError.message)
      return
    }

    console.log(`   ✅ Found ${paymentsData.length} payments`)
    
    // Check for null/undefined currency issues
    const nullCurrencyPayments = paymentsData.filter(p => !p.currency)
    const nullCountryPayments = paymentsData.filter(p => !p.country)
    
    console.log(`   💰 Null currency payments: ${nullCurrencyPayments.length}`)
    console.log(`   🌍 Null country payments: ${nullCountryPayments.length}`)

    if (nullCurrencyPayments.length > 0) {
      console.log('   ⚠️  Payments with null currency:')
      nullCurrencyPayments.slice(0, 3).forEach(p => {
        console.log(`     - ID: ${p.id}, Country: ${p.country}, Amount: ${p.amount}`)
      })
    }

    // Test 3: Geographic Analytics Logic Simulation
    console.log('\n3️⃣ Testing Geographic Analytics Logic:')
    
    const countryStats = new Map()
    let processedPayments = 0
    let skippedPayments = 0

    paymentsData.forEach(payment => {
      if (!payment.country) {
        skippedPayments++
        return
      }
      
      processedPayments++
      const existing = countryStats.get(payment.country) || {
        totalRevenue: 0,
        paymentCount: 0,
        completedPayments: 0,
        currency: payment.currency || 'USD'
      }

      existing.totalRevenue += parseFloat(payment.amount?.toString() || '0')
      existing.paymentCount += 1
      if (payment.status === 'completed') {
        existing.completedPayments += 1
      }

      countryStats.set(payment.country, existing)
    })

    console.log(`   ✅ Processed ${processedPayments} payments`)
    console.log(`   ⚠️  Skipped ${skippedPayments} payments (no country)`)
    console.log(`   🌍 Found ${countryStats.size} countries`)

    // Sort and format like the real function
    const formattedData = Array.from(countryStats.entries()).map(([country, stats]) => ({
      country_name: country,
      country_code: '',
      currency_code: stats.currency,
      payment_count: stats.paymentCount,
      total_revenue: stats.totalRevenue.toString(),
      avg_amount: stats.paymentCount > 0 ? (stats.totalRevenue / stats.paymentCount).toString() : '0',
      completed_payments: stats.completedPayments,
      success_rate: stats.paymentCount > 0 ? ((stats.completedPayments / stats.paymentCount) * 100).toString() : '0'
    }))

    formattedData.sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue))

    console.log('\n   📊 Geographic Analytics Results:')
    formattedData.forEach((item, index) => {
      console.log(`     ${index + 1}. ${item.country_name}:`)
      console.log(`        Currency: ${item.currency_code || 'NULL'}`)
      console.log(`        Revenue: ${item.total_revenue}`)
      console.log(`        Payments: ${item.payment_count}`)
      console.log(`        Success Rate: ${item.success_rate}%`)
    })

    // Test 4: Chart Data Transformation
    console.log('\n4️⃣ Testing Chart Data Transformation:')
    
    const top4Countries = formattedData.slice(0, 4)
    const chartData = top4Countries.map((item, index) => ({
      country: item.country_name,
      revenue: parseFloat(item.total_revenue),
      payments: item.payment_count,
      currency: item.currency_code || 'USD',
      fill: `violet-${index + 1}`,
    }))

    console.log('   📈 Chart Data (Top 4):')
    chartData.forEach((item, index) => {
      console.log(`     ${index + 1}. ${item.country}:`)
      console.log(`        Revenue: ${item.revenue}`)
      console.log(`        Currency: ${item.currency}`)
      console.log(`        Payments: ${item.payments}`)
      
      // Test the formatter logic that's causing the error
      try {
        const currency = item?.currency || item?.payload?.currency || 'USD'
        const formatted = `${currency} ${item.revenue.toLocaleString()}`
        console.log(`        Formatted: ${formatted}`)
      } catch (error) {
        console.log(`        ❌ Formatter Error: ${error.message}`)
      }
    })

    // Test 5: Currency Consistency
    console.log('\n5️⃣ Testing Currency Consistency:')
    
    const uniqueCurrencies = [...new Set(paymentsData.map(p => p.currency).filter(Boolean))]
    console.log(`   💰 Unique currencies in payments: ${uniqueCurrencies.join(', ')}`)
    
    const countryCurrencies = new Map()
    paymentsData.forEach(payment => {
      if (payment.country && payment.currency) {
        if (!countryCurrencies.has(payment.country)) {
          countryCurrencies.set(payment.country, new Set())
        }
        countryCurrencies.get(payment.country).add(payment.currency)
      }
    })

    console.log('   🌍 Currency by country:')
    Array.from(countryCurrencies.entries()).forEach(([country, currencies]) => {
      const currencyList = Array.from(currencies).join(', ')
      console.log(`     ${country}: ${currencyList}`)
      if (currencies.size > 1) {
        console.log(`       ⚠️  Multiple currencies for one country!`)
      }
    })

    // Test 6: Daily Revenue Analytics
    console.log('\n6️⃣ Testing Daily Revenue Analytics:')
    
    const timeRange = 30
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeRange)

    const filteredPayments = paymentsData.filter(payment => {
      const paymentDate = new Date(payment.created_at)
      return paymentDate >= startDate && paymentDate <= endDate
    })

    console.log(`   📅 Payments in last ${timeRange} days: ${filteredPayments.length}`)

    // Group by date
    const dailyData = new Map()
    
    // Initialize all dates
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyData.set(dateStr, { count: 0, total: 0 })
    }

    // Aggregate payment data
    filteredPayments.forEach(payment => {
      const date = new Date(payment.created_at).toISOString().split('T')[0]
      const existing = dailyData.get(date) || { count: 0, total: 0 }
      dailyData.set(date, {
        count: existing.count + 1,
        total: existing.total + (parseFloat(payment.amount?.toString() || '0'))
      })
    })

    const recentDays = Array.from(dailyData.entries())
      .slice(-7) // Last 7 days
      .filter(([, data]) => data.count > 0)

    console.log('   📊 Recent days with transactions:')
    recentDays.forEach(([date, data]) => {
      console.log(`     ${date}: ${data.count} transactions, ${data.total.toLocaleString()} total`)
    })

    console.log('\n✅ Comprehensive test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

testAnalyticsComprehensive() 