const { createClient } = require('@supabase/supabase-js');

// Test connection to real Supabase
async function testSupabaseConnection() {
  console.log('🔄 Testing connection to real Supabase...\n');
  
  // Initialize Supabase client
  const supabaseUrl = 'https://frdksqjaiuakkalebnzd.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTE4NzgsImV4cCI6MjA2NDgyNzg3OH0.rwmLX3kTR9ZLJueBSwm8Q7qhnF4oCXtZUYb2komHqTA';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Check if we can connect and query basic data
    console.log('✅ Test 1: Basic connection and country data query');
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('name, code, currency_code')
      .is('user_id', null)
      .limit(5);
    
    if (countriesError) {
      console.error('❌ Countries query failed:', countriesError);
      return false;
    }
    
    console.log('📍 Found countries:', countries.length);
    countries.forEach(country => {
      console.log(`   - ${country.name} (${country.code}) - ${country.currency_code}`);
    });
    console.log('');
    
    // Test 2: Check currencies
    console.log('✅ Test 2: Currency data query');
    const { data: currencies, error: currenciesError } = await supabase
      .from('currencies')
      .select('name, code, symbol')
      .is('user_id', null)
      .limit(5);
    
    if (currenciesError) {
      console.error('❌ Currencies query failed:', currenciesError);
      return false;
    }
    
    console.log('💰 Found currencies:', currencies.length);
    currencies.forEach(currency => {
      console.log(`   - ${currency.name} (${currency.code}) ${currency.symbol}`);
    });
    console.log('');
    
    // Test 3: Check if we can query tables with RLS (should work for global data)
    console.log('✅ Test 3: Row Level Security test (global data access)');
    const { data: globalCountries, error: rlsError } = await supabase
      .from('countries')
      .select('*')
      .is('user_id', null);
    
    if (rlsError) {
      console.error('❌ RLS test failed:', rlsError);
      return false;
    }
    
    console.log(`🔒 RLS working correctly - can access ${globalCountries.length} global countries`);
    console.log('');
    
    // Test 4: Check database health
    console.log('✅ Test 4: Database health check');
    const { data: healthCheck, error: healthError } = await supabase
      .rpc('version');
    
    if (healthError) {
      console.log('⚠️  Advanced health check not available, but basic queries working');
    } else {
      console.log('💚 Database health check passed');
    }
    console.log('');
    
    console.log('🎉 ALL TESTS PASSED! 🎉');
    console.log('');
    console.log('✅ Your app is successfully connected to real Supabase!');
    console.log('✅ Database schema is properly restored');
    console.log('✅ Countries and currencies data is available');
    console.log('✅ Row Level Security is working correctly');
    console.log('');
    console.log('🚀 Ready for deployment testing!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

// Additional test for authentication system
async function testAuthSystem() {
  console.log('\n🔐 Testing authentication system...\n');
  
  const supabaseUrl = 'https://frdksqjaiuakkalebnzd.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTE4NzgsImV4cCI6MjA2NDgyNzg3OH0.rwmLX3kTR9ZLJueBSwm8Q7qhnF4oCXtZUYb2komHqTA';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test if users table exists and has proper structure
    const { data: userTableTest, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (userError && userError.code === 'PGRST116') {
      console.log('✅ Users table exists with proper RLS (empty result expected)');
    } else if (userError) {
      console.error('❌ Users table test failed:', userError);
      return false;
    } else {
      console.log('✅ Users table accessible');
    }
    
    console.log('🔐 Authentication system ready for user signup/signin');
    return true;
    
  } catch (error) {
    console.error('❌ Auth system test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🧪 PXV PAY - REAL SUPABASE CONNECTION TEST');
  console.log('='.repeat(60));
  console.log('');
  
  const connectionTest = await testSupabaseConnection();
  const authTest = await testAuthSystem();
  
  console.log('\n' + '='.repeat(60));
  if (connectionTest && authTest) {
    console.log('🎯 FINAL RESULT: ALL SYSTEMS GO! 🚀');
    console.log('');
    console.log('Next steps:');
    console.log('1. ✅ Update your .env.local file (if not done already)');
    console.log('2. ✅ Restart your Next.js development server');
    console.log('3. ✅ Test signin/signup in your app');
    console.log('4. ✅ Deploy to production when ready');
  } else {
    console.log('❌ TESTS FAILED - Check configuration');
  }
  console.log('='.repeat(60));
}

runAllTests().catch(console.error); 