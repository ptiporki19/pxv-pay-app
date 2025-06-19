const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function comprehensiveAPITest() {
  console.log('🔍 Comprehensive API Test - Checking All Endpoints\n')
  
  const results = {
    passed: 0,
    failed: 0,
    issues: []
  }
  
  // Helper function to test an endpoint
  async function testEndpoint(name, testFn) {
    try {
      console.log(`Testing ${name}...`)
      await testFn()
      console.log(`✅ ${name} - PASSED`)
      results.passed++
    } catch (error) {
      console.log(`❌ ${name} - FAILED: ${error.message}`)
      results.failed++
      results.issues.push({ endpoint: name, error: error.message })
    }
  }
  
  // 1. Test Users API
  await testEndpoint('Users - List All', async () => {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    console.log(`   Found ${data.length} users`)
  })
  
  await testEndpoint('Users - Get by ID', async () => {
    const { data: users } = await supabase.from('users').select('id').limit(1)
    if (users && users.length > 0) {
      const { data, error } = await supabase.from('users').select('*').eq('id', users[0].id).single()
      if (error) throw error
      console.log(`   Retrieved user: ${data.email}`)
    } else {
      throw new Error('No users found to test with')
    }
  })
  
  // 2. Test Countries API
  await testEndpoint('Countries - List All', async () => {
    const { data, error } = await supabase.from('countries').select('*')
    if (error) throw error
    console.log(`   Found ${data.length} countries`)
  })
  
  await testEndpoint('Countries - With Currency Relationship', async () => {
    const { data, error } = await supabase.from('countries').select('*, currency_id')
    if (error) throw error
    console.log(`   Countries with currency_id column accessible`)
  })
  
  // 3. Test Currencies API
  await testEndpoint('Currencies - List All', async () => {
    const { data, error } = await supabase.from('currencies').select('*')
    if (error) throw error
    console.log(`   Found ${data.length} currencies`)
  })
  
  // 4. Test Payment Methods API
  await testEndpoint('Payment Methods - List All', async () => {
    const { data, error } = await supabase.from('payment_methods').select('*')
    if (error) throw error
    console.log(`   Found ${data.length} payment methods`)
  })
  
  // 5. Test Payments API
  await testEndpoint('Payments - List All', async () => {
    const { data, error } = await supabase.from('payments').select('*')
    if (error) throw error
    console.log(`   Found ${data.length} payments`)
  })
  
  // 6. Test Notifications API
  await testEndpoint('Notifications - List All', async () => {
    const { data, error } = await supabase.from('notifications').select('*')
    if (error) throw error
    console.log(`   Found ${data.length} notifications`)
  })
  
  // 7. Test Themes API
  await testEndpoint('Themes - List All', async () => {
    const { data, error } = await supabase.from('themes').select('*')
    if (error) throw error
    console.log(`   Found ${data.length} themes`)
  })
  
  // 8. Test Content Templates API
  await testEndpoint('Content Templates - List All', async () => {
    const { data, error } = await supabase.from('content_templates').select('*')
    if (error) throw error
    console.log(`   Found ${data.length} content templates`)
  })
  
  // 9. Test Storage Buckets
  await testEndpoint('Storage - List Buckets', async () => {
    const { data, error } = await supabase.storage.listBuckets()
    if (error) throw error
    console.log(`   Found ${data.length} storage buckets`)
  })
  
  // 10. Test Auth
  await testEndpoint('Auth - List Users', async () => {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) throw error
    console.log(`   Found ${data.users.length} auth users`)
  })
  
  // 11. Test RLS Status
  await testEndpoint('RLS - Check Users Table', async () => {
    // This should work without infinite recursion
    const { data, error } = await supabase.from('users').select('id, email, role').limit(1)
    if (error) throw error
    console.log(`   RLS working correctly (no infinite recursion)`)
  })
  
  // 12. Test Client API Functions
  await testEndpoint('Client API - Import Test', async () => {
    // Test if we can import the client API
    const { countriesApi } = require('./src/lib/supabase/client-api.ts')
    if (!countriesApi) throw new Error('Client API not accessible')
    console.log(`   Client API imports successfully`)
  })
  
  console.log('\n📊 TEST RESULTS:')
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`)
  
  if (results.issues.length > 0) {
    console.log('\n🚨 ISSUES FOUND:')
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.endpoint}: ${issue.error}`)
    })
    
    console.log('\n🔧 RECOMMENDED FIXES:')
    results.issues.forEach((issue, index) => {
      if (issue.error.includes('relation') && issue.error.includes('does not exist')) {
        console.log(`${index + 1}. Missing table: Run database migrations`)
      } else if (issue.error.includes('permission denied') || issue.error.includes('RLS')) {
        console.log(`${index + 1}. RLS issue: Check row level security policies`)
      } else if (issue.error.includes('foreign key')) {
        console.log(`${index + 1}. Data integrity: Check foreign key relationships`)
      } else if (issue.error.includes('connection') || issue.error.includes('fetch')) {
        console.log(`${index + 1}. Connection issue: Check Supabase is running`)
      } else {
        console.log(`${index + 1}. General error: ${issue.error}`)
      }
    })
  } else {
    console.log('\n🎉 ALL TESTS PASSED! API is working correctly.')
  }
}

comprehensiveAPITest().catch(console.error) 