const fetch = require('node-fetch');

async function testApiMinimal() {
  console.log('🧪 Testing API with minimal data...\n');

  try {
    // Test with just form data, no file
    const formData = new URLSearchParams();
    formData.append('customer_name', 'Test Customer');
    formData.append('customer_email', 'test@example.com');
    formData.append('amount', '50.00');
    formData.append('country', 'US');
    formData.append('payment_method_id', '80690fa1-09e4-4f6b-9fb9-d93bfe5c3772');
    formData.append('checkout_link_id', 'a9d18b1c-5b50-4a73-9121-1e907478a495');

    console.log('📤 Submitting minimal test...');

    const response = await fetch('http://localhost:3000/api/checkout/simple-payment/submit', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const result = await response.json();

    console.log('📋 Response status:', response.status);
    console.log('📋 Response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testApiMinimal(); 