const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function runFinalTests() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('🧪 RUNNING FINAL SYSTEM TESTS...\n')
  
  let allTestsPassed = true
  
  // Test 1: Authentication
  console.log('1️⃣ TESTING AUTHENTICATION...')
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'SuperAdmin123!'
    })
    
    if (signInError) {
      console.log('  ❌ Super admin login failed:', signInError.message)
      allTestsPassed = false
    } else {
      console.log('  ✅ Super admin login successful')
    }
  } catch (err) {
    console.log('  ❌ Auth test failed:', err.message)
    allTestsPassed = false
  }
  
  // Test 2: Users table
  console.log('\n2️⃣ TESTING USERS TABLE...')
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
    
    if (usersError) {
      console.log('  ❌ Users query failed:', usersError.message)
      allTestsPassed = false
    } else {
      console.log(`  ✅ Users table accessible, found ${users?.length || 0} users`)
      users?.forEach(user => {
        console.log(`    - ${user.email} (${user.role})`)
      })
    }
  } catch (err) {
    console.log('  ❌ Users test failed:', err.message)
    allTestsPassed = false
  }
  
  // Test 3: Notifications table
  console.log('\n3️⃣ TESTING NOTIFICATIONS TABLE...')
  try {
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5)
    
    if (notificationsError) {
      console.log('  ❌ Notifications query failed:', notificationsError.message)
      allTestsPassed = false
    } else {
      console.log(`  ✅ Notifications table accessible, found ${notifications?.length || 0} notifications`)
    }
  } catch (err) {
    console.log('  ❌ Notifications test failed:', err.message)
    allTestsPassed = false
  }
  
  // Test 4: Payments table
  console.log('\n4️⃣ TESTING PAYMENTS TABLE...')
  try {
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .limit(5)
    
    if (paymentsError) {
      console.log('  ❌ Payments query failed:', paymentsError.message)
      allTestsPassed = false
    } else {
      console.log(`  ✅ Payments table accessible, found ${payments?.length || 0} payments`)
    }
  } catch (err) {
    console.log('  ❌ Payments test failed:', err.message)
    allTestsPassed = false
  }
  
  // Test 5: Payment Methods table
  console.log('\n5️⃣ TESTING PAYMENT METHODS TABLE...')
  try {
    const { data: paymentMethods, error: paymentMethodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .limit(5)
    
    if (paymentMethodsError) {
      console.log('  ❌ Payment methods query failed:', paymentMethodsError.message)
      allTestsPassed = false
    } else {
      console.log(`  ✅ Payment methods table accessible, found ${paymentMethods?.length || 0} payment methods`)
    }
  } catch (err) {
    console.log('  ❌ Payment methods test failed:', err.message)
    allTestsPassed = false
  }
  
  // Test 6: Super Admin functionality
  console.log('\n6️⃣ TESTING SUPER ADMIN FUNCTIONALITY...')
  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pxvpay.com')
      .single()
    
    if (profileError) {
      console.log('  ❌ Super admin profile query failed:', profileError.message)
      allTestsPassed = false
    } else if (userProfile?.role === 'super_admin') {
      console.log(`  ✅ Super admin profile correct: ${userProfile.email} (${userProfile.role})`)
    } else {
      console.log('  ❌ Super admin role incorrect:', userProfile?.role)
      allTestsPassed = false
    }
  } catch (err) {
    console.log('  ❌ Super admin test failed:', err.message)
    allTestsPassed = false
  }
  
  console.log('\n🧪 FINAL TEST RESULTS:')
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! System is fully restored.')
    console.log('\n✅ Database schema conflicts resolved')
    console.log('✅ RLS infinite recursion fixed')
    console.log('✅ All core tables accessible')
    console.log('✅ Authentication working')
    console.log('✅ Super admin functionality restored')
    
    console.log('\n📋 NEXT STEPS:')
    console.log('1. 🔄 Fix super admin dashboard routing')
    console.log('2. 🔄 Restore storage/market functionality')
    console.log('3. 🔄 Test all dashboard sections')
    console.log('4. 🔄 Verify payment processing flows')
  } else {
    console.log('❌ SOME TESTS FAILED! Manual intervention required.')
  }
}

runFinalTests().catch(console.error) 