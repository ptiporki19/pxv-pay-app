const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function diagnoseCurrentDatabase() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('🔍 DIAGNOSING CURRENT DATABASE STATE...\n')
  
  // 1. Check specific tables directly by attempting queries
  console.log('1. CHECKING CRITICAL TABLES:')
  
  // Test users table
  const { data: usersTest, error: usersError } = await supabase
    .from('users')
    .select('count(*)')
    .limit(1)
  
  // Test profiles table  
  const { data: profilesTest, error: profilesError } = await supabase
    .from('profiles')
    .select('count(*)')
    .limit(1)
  
  // Test payments table
  const { data: paymentsTest, error: paymentsError } = await supabase
    .from('payments')
    .select('count(*)')
    .limit(1)
  
  // Test notifications table
  const { data: notificationsTest, error: notificationsError } = await supabase
    .from('notifications')
    .select('count(*)')
    .limit(1)
  
  // Test payment_methods table
  const { data: paymentMethodsTest, error: paymentMethodsError } = await supabase
    .from('payment_methods')
    .select('count(*)')
    .limit(1)
    
  // Test countries table
  const { data: countriesTest, error: countriesError } = await supabase
    .from('countries')
    .select('count(*)')
    .limit(1)
    
  // Test currencies table
  const { data: currenciesTest, error: currenciesError } = await supabase
    .from('currencies')
    .select('count(*)')
    .limit(1)
  
  console.log(`  - users table: ${!usersError ? '✅ EXISTS' : '❌ MISSING (' + usersError.code + ')'}`)
  console.log(`  - profiles table: ${!profilesError ? '⚠️ EXISTS (OLD SCHEMA)' : '✅ NOT FOUND (' + profilesError.code + ')'}`)
  console.log(`  - payments table: ${!paymentsError ? '✅ EXISTS' : '❌ MISSING (' + paymentsError.code + ')'}`)
  console.log(`  - notifications table: ${!notificationsError ? '✅ EXISTS' : '❌ MISSING (' + notificationsError.code + ')'}`)
  console.log(`  - payment_methods table: ${!paymentMethodsError ? '✅ EXISTS' : '❌ MISSING (' + paymentMethodsError.code + ')'}`)
  console.log(`  - countries table: ${!countriesError ? '✅ EXISTS' : '❌ MISSING (' + countriesError.code + ')'}`)
  console.log(`  - currencies table: ${!currenciesError ? '✅ EXISTS' : '❌ MISSING (' + currenciesError.code + ')'}`)
  
  if (!usersError && !profilesError) {
    console.log('\n  🚨 CRITICAL CONFLICT: Both users and profiles tables exist!')
    console.log('  🚨 This explains the RLS recursion errors!')
  }
  
  // 2. Check current auth users
  console.log('\n2. CHECKING AUTH USERS:')
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.log('  ❌ Error fetching auth users:', authError.message)
  } else {
    console.log(`  📊 Total auth users: ${authUsers.users?.length || 0}`)
    authUsers.users?.forEach(user => {
      console.log(`    - ${user.email} (${user.id})`)
    })
  }
  
  // 3. Check data in users table (if exists)
  if (!usersError) {
    console.log('\n3. CHECKING USERS TABLE DATA:')
    const { data: usersData, error: usersDataError } = await supabase
      .from('users')
      .select('*')
      .limit(10)
    
    if (usersDataError) {
      console.log('  ❌ Error fetching users:', usersDataError.message)
    } else {
      console.log(`  📊 Total users in users table: ${usersData?.length || 0}`)
      usersData?.forEach(user => {
        console.log(`    - ${user.email} (${user.role}) - ${user.id}`)
      })
    }
  }
  
  // 4. Check data in profiles table (if exists)
  if (!profilesError) {
    console.log('\n4. CHECKING PROFILES TABLE DATA:')
    const { data: profilesData, error: profilesDataError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10)
    
    if (profilesDataError) {
      console.log('  ❌ Error fetching profiles:', profilesDataError.message)
    } else {
      console.log(`  📊 Total profiles in profiles table: ${profilesData?.length || 0}`)
      profilesData?.forEach(profile => {
        console.log(`    - ${profile.full_name || 'No name'} (${profile.user_type}) - ${profile.id}`)
      })
    }
  }
  
  // 5. Test the exact failing query from the app
  console.log('\n5. TESTING PAYMENTS QUERY (FROM ERROR LOGS):')
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .limit(1)
    
    if (error) {
      console.log('  ❌ Query failed:', error.message)
      if (error.message.includes('infinite recursion') || error.message.includes('profiles')) {
        console.log('  🚨 CONFIRMED: This is the profiles RLS recursion issue!')
      }
    } else {
      console.log('  ✅ Query succeeded, found', data?.length || 0, 'records')
    }
  } catch (err) {
    console.log('  ❌ Query threw error:', err.message)
  }
  
  // 6. Test authentication with service role vs authenticated user
  console.log('\n6. TESTING AUTH CONTEXT:')
  const { data: session, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.log('  ❌ Error getting session:', sessionError.message)
  } else {
    console.log(`  📊 Session active: ${session?.session ? 'YES' : 'NO'}`)
    if (session?.session) {
      console.log(`  📊 User ID: ${session.session.user.id}`)
      console.log(`  📊 User email: ${session.session.user.email}`)
    }
  }
  
  // 7. Try to sign in as super admin and test
  console.log('\n7. TESTING SUPER ADMIN LOGIN:')
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'SuperAdmin123!'
    })
    
    if (signInError) {
      console.log('  ❌ Super admin login failed:', signInError.message)
    } else {
      console.log('  ✅ Super admin login successful')
      
      // Now try the query with authenticated super admin
      console.log('\n8. TESTING PAYMENTS QUERY AS SUPER ADMIN:')
      const { data: paymentsAsAdmin, error: paymentsAsAdminError } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'pending')
        .limit(1)
      
      if (paymentsAsAdminError) {
        console.log('  ❌ Query as super admin failed:', paymentsAsAdminError.message)
        if (paymentsAsAdminError.message.includes('infinite recursion') || paymentsAsAdminError.message.includes('profiles')) {
          console.log('  🚨 CONFIRMED: The profiles table RLS policies are causing recursion!')
        }
      } else {
        console.log('  ✅ Query as super admin succeeded')
      }
    }
  } catch (err) {
    console.log('  ❌ Auth test failed:', err.message)
  }
  
  console.log('\n🔍 DIAGNOSIS COMPLETE!')
  console.log('\n📋 SUMMARY:')
  
  if (!usersError && !profilesError) {
    console.log('⚠️ CRITICAL ISSUE: Both users and profiles tables exist')
    console.log('⚠️ This creates RLS policy conflicts causing infinite recursion')
    console.log('⚠️ Need to resolve table structure conflicts')
  }
  
  if (!paymentsError && !notificationsError) {
    console.log('✅ Core tables (payments, notifications) exist')
  }
  
  console.log('🔧 Next steps: Fix table conflicts and RLS policies')
}

diagnoseCurrentDatabase().catch(console.error) 