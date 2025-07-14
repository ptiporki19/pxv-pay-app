const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../pxv-pay/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAnalyticsDirect() {
  console.log('🧪 Direct Analytics Data Test\n')

  try {
    // Test 1: Check payments table structure and data
    console.log('1️⃣ Testing Payments Table:')
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('id, country, currency, amount, status, merchant_id, created_at, customer_name, customer_email, payment_method')
      .limit(20)

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError.message)
      return
    }

    console.log(`   ✅ Found ${paymentsData.length} payments in database`)
    
    if (paymentsData.length === 0) {
      console.log('   ⚠️  No payments found in database')
      return
    }

    // Show sample payment structure
    console.log('\n   📋 Sample Payment Structure:')
    const samplePayment = paymentsData[0]
    Object.keys(samplePayment).forEach(key => {
      console.log(`     ${key}: ${samplePayment[key]}`)
    })

    // Test 2: Currency Analysis
    console.log('\n2️⃣ Testing Currency Data:')
    const currencyStats = new Map()
    const nullCurrencyPayments = []
    const nullCountryPayments = []

    paymentsData.forEach(payment => {
      if (!payment.currency) {
        nullCurrencyPayments.push(payment.id)
      }
      if (!payment.country) {
        nullCountryPayments.push(payment.id)
      }
      
      const currency = payment.currency || 'NULL'
      currencyStats.set(currency, (currencyStats.get(currency) || 0) + 1)
    })

    console.log('   💰 Currency distribution:')
    Array.from(currencyStats.entries()).forEach(([currency, count]) => {
      console.log(`     ${currency}: ${count} payments`)
    })

    console.log(`   ⚠️  Null currency payments: ${nullCurrencyPayments.length}`)
    console.log(`   ⚠️  Null country payments: ${nullCountryPayments.length}`)

    if (nullCurrencyPayments.length > 0) {
      console.log('   🔍 Payments with null currency:')
      nullCurrencyPayments.slice(0, 3).forEach(id => {
        const payment = paymentsData.find(p => p.id === id)
        console.log(`     - ID: ${id}, Country: ${payment.country}, Amount: ${payment.amount}`)
      })
    }

    // Test 3: Geographic Analytics Simulation
    console.log('\n3️⃣ Testing Geographic Analytics Logic:')
    
    const countryStats = new Map()
    paymentsData.forEach(payment => {
      if (!payment.country) return
      
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

    console.log(`   🌍 Found ${countryStats.size} countries`)
    
    const formattedData = Array.from(countryStats.entries()).map(([country, stats]) => ({
      country_name: country,
      currency_code: stats.currency,
      payment_count: stats.paymentCount,
      total_revenue: stats.totalRevenue.toString(),
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

    // Test 4: Chart Data Formatting (the problematic part)
    console.log('\n4️⃣ Testing Chart Data Formatting:')
    
    const top4Countries = formattedData.slice(0, 4)
    console.log('   📈 Top 4 Countries Chart Data:')
    
    top4Countries.forEach((item, index) => {
      console.log(`\n     ${index + 1}. ${item.country_name}:`)
      
      // Test the exact chart data transformation
      const chartItem = {
        country: item.country_name,
        revenue: parseFloat(item.total_revenue),
        payments: item.payment_count,
        currency: item.currency_code || 'USD',
        fill: `violet-${index + 1}`,
      }
      
      console.log(`        Chart Data:`, chartItem)
      
      // Test the problematic formatter functions
      console.log('        Testing Formatters:')
      
      // Test 1: LabelList formatter
      try {
        const currency = chartItem?.currency || chartItem?.payload?.currency || 'USD'
        const formatted1 = `${currency} ${chartItem.revenue.toLocaleString()}`
        console.log(`          LabelList: ${formatted1} ✅`)
      } catch (error) {
        console.log(`          LabelList: ❌ ${error.message}`)
      }
      
      // Test 2: Tooltip formatter
      try {
        const mockProps = { payload: chartItem }
        const currency = mockProps.payload?.currency || 'USD'
        const formatted2 = `${currency} ${Number(chartItem.revenue).toLocaleString()}`
        console.log(`          Tooltip: ${formatted2} ✅`)
      } catch (error) {
        console.log(`          Tooltip: ❌ ${error.message}`)
      }
      
      // Test 3: Footer formatter
      try {
        const formatted3 = `${chartItem.country} with ${chartItem.currency} ${chartItem.revenue.toLocaleString()}`
        console.log(`          Footer: ${formatted3} ✅`)
      } catch (error) {
        console.log(`          Footer: ❌ ${error.message}`)
      }
    })

    console.log('\n✅ Direct analytics test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

testAnalyticsDirect() 