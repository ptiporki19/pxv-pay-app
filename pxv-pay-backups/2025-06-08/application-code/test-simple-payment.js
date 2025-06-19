// Simple test without file upload to isolate the issue
const fetch = require('node-fetch');

async function testSimplePayment() {
  console.log('🔍 Testing Payment API Components...\n');

  try {
    // Test 1: Validate checkout link
    console.log('1️⃣ Testing checkout validation...');
    const validateResponse = await fetch('http://localhost:3000/api/checkout/simple-payment/validate');
    const validateData = await validateResponse.json();
    
    if (validateResponse.ok) {
      console.log('✅ Checkout validation successful');
      console.log('   Checkout ID:', validateData.checkout_link.id);
      console.log('   Merchant ID:', validateData.checkout_link.merchant_id);
    } else {
      console.log('❌ Checkout validation failed:', validateData);
      return;
    }

    // Test 2: Get payment methods
    console.log('\n2️⃣ Testing payment methods...');
    const methodsResponse = await fetch('http://localhost:3000/api/checkout/simple-payment/methods?country=US');
    const methodsData = await methodsResponse.json();
    
    if (methodsResponse.ok) {
      console.log('✅ Payment methods retrieved successfully');
      console.log('   Methods found:', methodsData.payment_methods?.length || 0);
      if (methodsData.payment_methods?.length > 0) {
        console.log('   First method:', methodsData.payment_methods[0].name, methodsData.payment_methods[0].id);
      }
    } else {
      console.log('❌ Payment methods failed:', methodsData);
      return;
    }

    // Test 3: Get countries
    console.log('\n3️⃣ Testing countries...');
    const countriesResponse = await fetch('http://localhost:3000/api/checkout/simple-payment/countries');
    const countriesData = await countriesResponse.json();
    
    if (countriesResponse.ok) {
      console.log('✅ Countries retrieved successfully');
      console.log('   Countries found:', countriesData.countries?.length || 0);
    } else {
      console.log('❌ Countries failed:', countriesData);
    }

    console.log('\n🎯 All checkout components are working! The issue might be with file upload or payment insertion.');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testSimplePayment(); 