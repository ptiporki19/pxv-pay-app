const { createClient } = require('@supabase/supabase-js')

// Test with anon key (like frontend)
const supabaseAnon = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

// Test with service role (like backend)
const supabaseService = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function testFrontendAuth() {
  console.log('🔍 Testing Frontend Authentication Flow\n')
  
  // 1. Test unauthenticated access (like frontend before login)
  console.log('1. Testing unauthenticated access...')
  try {
    const { data, error } = await supabaseAnon.from('users').select('*')
    if (error) {
      console.log(`❌ Unauthenticated access failed: ${error.message}`)
    } else {
      console.log(`✅ Unauthenticated access works: ${data.length} users`)
    }
  } catch (error) {
    console.log(`❌ Unauthenticated access error: ${error.message}`)
  }
  
  // 2. Test login
  console.log('\n2. Testing login...')
  try {
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })
    
    if (authError) {
      console.log(`❌ Login failed: ${authError.message}`)
      return
    } else {
      console.log(`✅ Login successful: ${authData.user.email}`)
    }
    
    // 3. Test authenticated access
    console.log('\n3. Testing authenticated access...')
    
    // Test users
    const { data: users, error: usersError } = await supabaseAnon.from('users').select('*')
    if (usersError) {
      console.log(`❌ Users fetch failed: ${usersError.message}`)
    } else {
      console.log(`✅ Users fetch works: ${users.length} users`)
    }
    
    // Test countries
    const { data: countries, error: countriesError } = await supabaseAnon.from('countries').select('*')
    if (countriesError) {
      console.log(`❌ Countries fetch failed: ${countriesError.message}`)
    } else {
      console.log(`✅ Countries fetch works: ${countries.length} countries`)
    }
    
    // Test currencies
    const { data: currencies, error: currenciesError } = await supabaseAnon.from('currencies').select('*')
    if (currenciesError) {
      console.log(`❌ Currencies fetch failed: ${currenciesError.message}`)
    } else {
      console.log(`✅ Currencies fetch works: ${currencies.length} currencies`)
    }
    
    // Test payment methods
    const { data: paymentMethods, error: paymentMethodsError } = await supabaseAnon.from('payment_methods').select('*')
    if (paymentMethodsError) {
      console.log(`❌ Payment methods fetch failed: ${paymentMethodsError.message}`)
    } else {
      console.log(`✅ Payment methods fetch works: ${paymentMethods.length} payment methods`)
    }
    
    // Test user profile (specific user)
    const { data: userProfile, error: profileError } = await supabaseAnon
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.log(`❌ User profile fetch failed: ${profileError.message}`)
    } else {
      console.log(`✅ User profile fetch works: ${userProfile.email}`)
    }
    
  } catch (error) {
    console.log(`❌ Authentication flow error: ${error.message}`)
  }
  
  // 4. Test RLS policies specifically
  console.log('\n4. Testing RLS policies...')
  try {
    // Check if RLS is actually disabled
    const { data: rlsCheck, error: rlsError } = await supabaseService.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE tablename = 'users' AND schemaname = 'public';
      `
    })
    
    if (rlsError) {
      console.log(`❌ RLS check failed: ${rlsError.message}`)
    } else {
      console.log(`✅ RLS status checked`)
    }
  } catch (error) {
    console.log(`⚠️ RLS check not available via this method`)
  }
  
  console.log('\n📋 SUMMARY:')
  console.log('If all tests above passed, the API is working correctly.')
  console.log('If you still see errors in the frontend, the issue might be:')
  console.log('1. Frontend authentication state not properly set')
  console.log('2. Environment variables not matching')
  console.log('3. Client-side caching issues')
  console.log('4. Component-level error handling')
}

testFrontendAuth().catch(console.error) 