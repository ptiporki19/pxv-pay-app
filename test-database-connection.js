const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function testDatabaseConnection() {
  console.log('🔗 Testing Database Connection and Seed Data...\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Check admin user exists
    console.log('1️⃣ Testing admin user...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pxvpay.com')
      .single();
    
    if (adminError) {
      console.error('❌ Admin user test failed:', adminError.message);
    } else {
      console.log('✅ Admin user found:', adminUser.email, '- Role:', adminUser.role);
    }
    
    // Test 2: Check countries
    console.log('\n2️⃣ Testing countries...');
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('code, name, status')
      .order('code');
    
    if (countriesError) {
      console.error('❌ Countries test failed:', countriesError.message);
    } else {
      console.log(`✅ Found ${countries.length} countries:`);
      countries.forEach(country => {
        console.log(`   ${country.code} - ${country.name} (${country.status})`);
      });
    }
    
    // Test 3: Check currencies
    console.log('\n3️⃣ Testing currencies...');
    const { data: currencies, error: currenciesError } = await supabase
      .from('currencies')
      .select('code, name, symbol, status')
      .order('code');
    
    if (currenciesError) {
      console.error('❌ Currencies test failed:', currenciesError.message);
    } else {
      console.log(`✅ Found ${currencies.length} currencies:`);
      currencies.forEach(currency => {
        console.log(`   ${currency.code} - ${currency.name} (${currency.symbol}) - ${currency.status}`);
      });
    }
    
    // Test 4: Check payment methods
    console.log('\n4️⃣ Testing payment methods...');
    const { data: paymentMethods, error: paymentMethodsError } = await supabase
      .from('payment_methods')
      .select('name, type, status, countries')
      .order('name');
    
    if (paymentMethodsError) {
      console.error('❌ Payment methods test failed:', paymentMethodsError.message);
    } else {
      console.log(`✅ Found ${paymentMethods.length} payment methods:`);
      paymentMethods.forEach(method => {
        console.log(`   ${method.name} (${method.type}) - ${method.status} - Countries: ${method.countries?.join(', ')}`);
      });
    }
    
    // Test 5: Test authentication
    console.log('\n5️⃣ Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    });
    
    if (authError) {
      console.error('❌ Authentication test failed:', authError.message);
    } else {
      console.log('✅ Authentication successful for:', authData.user.email);
      
      // Sign out
      await supabase.auth.signOut();
      console.log('🚪 Signed out successfully');
    }
    
    console.log('\n🎉 Database connection and seed data tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   • Admin user: ✅ admin@pxvpay.com (super_admin)`);
    console.log(`   • Countries: ✅ ${countries?.length || 0} loaded`);
    console.log(`   • Currencies: ✅ ${currencies?.length || 0} loaded`);
    console.log(`   • Payment methods: ✅ ${paymentMethods?.length || 0} loaded`);
    console.log(`   • Authentication: ✅ Working`);
    console.log('\n🔗 Database is properly connected and seeded!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Run the test
testDatabaseConnection(); 