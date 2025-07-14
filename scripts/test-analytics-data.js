#!/usr/bin/env node

/**
 * Test script to validate analytics data consistency
 * Specifically tests data for afriglobalimports@gmail.com user
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

// Create service role client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testUserData() {
  console.log('🔍 Testing analytics data for afriglobalimports@gmail.com...\n')

  try {
    // 1. Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'afriglobalimports@gmail.com')
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError?.message)
      return
    }

    console.log('👤 User Profile:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Active: ${user.active}`)
    console.log(`   ID: ${user.id}\n`)

    // 2. Get user's payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', user.id)

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError.message)
      return
    }

    console.log('💳 User Payments:')
    console.log(`   Total payments: ${payments?.length || 0}`)
    
    if (payments && payments.length > 0) {
      const countries = [...new Set(payments.map(p => p.country).filter(Boolean))]
      const currencies = [...new Set(payments.map(p => p.currency).filter(Boolean))]
      const totalAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
      
      console.log(`   Countries: ${countries.join(', ')}`)
      console.log(`   Currencies: ${currencies.join(', ')}`)
      console.log(`   Total amount: ${totalAmount}`)
      console.log(`   Status breakdown:`)
      
      const statusCounts = payments.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      }, {})
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`     ${status}: ${count}`)
      })
    }
    console.log()

    // 3. Get user's countries (check both user-specific and global countries)
    let userCountries = []
    
    // Try user-specific countries first
    const { data: userSpecificCountries, error: userCountriesError } = await supabase
      .from('countries')
      .select('*')
      .eq('user_id', user.id)

    if (userCountriesError && userCountriesError.message.includes('user_id does not exist')) {
      // Fall back to global countries or countries without user_id filtering
      console.log('🌍 User Countries:')
      console.log('   Note: Using global countries (no user-specific countries table)')
      
      // Get global countries that might be relevant
      const { data: globalCountries, error: globalError } = await supabase
        .from('countries')
        .select('*')
        .is('user_id', null)
        .limit(10)
      
      if (!globalError && globalCountries) {
        console.log(`   Global countries available: ${globalCountries.length}`)
        userCountries = globalCountries
      }
    } else {
      userCountries = userSpecificCountries || []
      console.log('🌍 User Countries:')
      console.log(`   Total countries: ${userCountries.length}`)
      userCountries.forEach(country => {
        console.log(`     ${country.name} (${country.code}) - ${country.status}`)
      })
    }
    console.log()

    // 4. Get user's payment methods
    const { data: paymentMethods, error: methodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)

    console.log('💰 User Payment Methods:')
    if (methodsError) {
      console.log(`   Error: ${methodsError.message}`)
    } else {
      console.log(`   Total methods: ${paymentMethods?.length || 0}`)
      paymentMethods?.forEach(method => {
        console.log(`     ${method.name} (${method.type}) - ${method.status}`)
        console.log(`       Countries: ${method.countries?.join(', ') || 'None'}`)
      })
    }
    console.log()

    // 5. Test role-based access
    console.log('🔐 Role-based Access Test:')
    const isSuperAdmin = user.role === 'super_admin' || 
      user.email === 'admin@pxvpay.com' ||
      user.email === 'dev-admin@pxvpay.com' ||
      user.email === 'superadmin@pxvpay.com'
    
    console.log(`   Is Super Admin: ${isSuperAdmin}`)
    console.log(`   Should see all data: ${isSuperAdmin}`)
    console.log(`   Should see only own data: ${!isSuperAdmin}`)
    console.log()

    // 6. Validate data consistency
    console.log('✅ Data Consistency Check:')
    
    // Check if countries in payments match user's configured countries
    const paymentCountries = [...new Set(payments?.map(p => p.country).filter(Boolean))]
    const configuredCountries = userCountries?.map(c => c.name) || []
    
    console.log('   Payment countries vs Configured countries:')
    paymentCountries.forEach(country => {
      const isConfigured = configuredCountries.includes(country)
      console.log(`     ${country}: ${isConfigured ? '✅ Configured' : '⚠️ Not configured'}`)
    })

    if (paymentCountries.some(country => !configuredCountries.includes(country))) {
      console.log('\n⚠️  WARNING: Some payment countries are not in user\'s configured countries!')
      console.log('   This could indicate data inconsistency or test data.')
    }

    console.log('\n🎯 Test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testUserData().catch(console.error) 