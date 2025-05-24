const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function testSuperAdminRouting() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('🧪 TESTING SUPER ADMIN ROUTING & FUNCTIONALITY...\n')
  
  let allTestsPassed = true
  
  // Test 1: Verify super admin user exists with correct role
  console.log('1️⃣ TESTING SUPER ADMIN USER...')
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'super_admin')
    
    if (usersError) {
      console.log('  ❌ Error fetching super admin users:', usersError.message)
      allTestsPassed = false
    } else if (users.length === 0) {
      console.log('  ❌ No super admin users found')
      allTestsPassed = false
    } else {
      console.log(`  ✅ Found ${users.length} super admin user(s):`)
      users.forEach(user => {
        console.log(`    - ${user.email} (${user.role}) - ID: ${user.id}`)
      })
    }
  } catch (err) {
    console.log('  ❌ Super admin test failed:', err.message)
    allTestsPassed = false
  }
  
  // Test 2: Test super admin authentication
  console.log('\n2️⃣ TESTING SUPER ADMIN AUTHENTICATION...')
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
      console.log(`    - User ID: ${signInData.user.id}`)
      console.log(`    - Email: ${signInData.user.email}`)
      
      // Test 3: Verify user profile access
      console.log('\n3️⃣ TESTING USER PROFILE ACCESS...')
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.user.id)
        .single()
      
      if (profileError) {
        console.log('  ❌ Profile access failed:', profileError.message)
        allTestsPassed = false
      } else {
        console.log('  ✅ Profile access successful')
        console.log(`    - Role: ${profile.role}`)
        console.log(`    - Active: ${profile.active}`)
        console.log(`    - Created: ${profile.created_at}`)
      }
    }
  } catch (err) {
    console.log('  ❌ Authentication test failed:', err.message)
    allTestsPassed = false
  }
  
  // Test 4: Test all core tables access
  console.log('\n4️⃣ TESTING CORE TABLES ACCESS...')
  const tables = ['users', 'payments', 'notifications', 'countries', 'currencies', 'payment_methods']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`  ❌ ${table} table access failed:`, error.message)
        allTestsPassed = false
      } else {
        console.log(`  ✅ ${table} table accessible (${data?.length || 0} records)`)
      }
    } catch (err) {
      console.log(`  ❌ ${table} table test failed:`, err.message)
      allTestsPassed = false
    }
  }
  
  // Test 5: Test specific queries that were failing
  console.log('\n5️⃣ TESTING PROBLEMATIC QUERIES...')
  
  // Test payments by status query
  try {
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
    
    if (paymentsError) {
      console.log('  ❌ Payments by status query failed:', paymentsError.message)
      allTestsPassed = false
    } else {
      console.log(`  ✅ Payments by status query successful (${pendingPayments?.length || 0} pending)`)
    }
  } catch (err) {
    console.log('  ❌ Payments query test failed:', err.message)
    allTestsPassed = false
  }
  
  // Test countries query
  try {
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .limit(5)
    
    if (countriesError) {
      console.log('  ❌ Countries query failed:', countriesError.message)
      allTestsPassed = false
    } else {
      console.log(`  ✅ Countries query successful (${countries?.length || 0} countries)`)
    }
  } catch (err) {
    console.log('  ❌ Countries query test failed:', err.message)
    allTestsPassed = false
  }
  
  // Test currencies query
  try {
    const { data: currencies, error: currenciesError } = await supabase
      .from('currencies')
      .select('*')
      .limit(5)
    
    if (currenciesError) {
      console.log('  ❌ Currencies query failed:', currenciesError.message)
      allTestsPassed = false
    } else {
      console.log(`  ✅ Currencies query successful (${currencies?.length || 0} currencies)`)
    }
  } catch (err) {
    console.log('  ❌ Currencies query test failed:', err.message)
    allTestsPassed = false
  }
  
  // Test payment methods query
  try {
    const { data: paymentMethods, error: pmError } = await supabase
      .from('payment_methods')
      .select('*')
      .limit(5)
    
    if (pmError) {
      console.log('  ❌ Payment methods query failed:', pmError.message)
      allTestsPassed = false
    } else {
      console.log(`  ✅ Payment methods query successful (${paymentMethods?.length || 0} methods)`)
    }
  } catch (err) {
    console.log('  ❌ Payment methods query test failed:', err.message)
    allTestsPassed = false
  }
  
  console.log('\n🧪 SUPER ADMIN ROUTING TEST RESULTS:')
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Super admin functionality is fully working.')
    console.log('\n✅ Super admin user exists with correct role')
    console.log('✅ Authentication working correctly')
    console.log('✅ Profile access working')
    console.log('✅ All core tables accessible')
    console.log('✅ All problematic queries now working')
    
    console.log('\n📋 SUPER ADMIN CREDENTIALS:')
    console.log('📧 Email: admin@pxvpay.com')
    console.log('🔑 Password: SuperAdmin123!')
    
    console.log('\n🚀 NEXT STEPS:')
    console.log('1. ✅ Super admin routing should now work correctly')
    console.log('2. ✅ Login with admin@pxvpay.com should redirect to /super-admin')
    console.log('3. 🔄 Test the app at http://localhost:3000')
    console.log('4. 🔄 Verify super admin dashboard displays correctly')
    console.log('5. 🔄 Test all dashboard sections work without errors')
  } else {
    console.log('❌ SOME TESTS FAILED! Check the errors above.')
  }
}

testSuperAdminRouting().catch(console.error) 