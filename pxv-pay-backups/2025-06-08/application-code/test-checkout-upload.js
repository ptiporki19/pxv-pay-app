const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testCheckoutUpload() {
  console.log('🧪 Testing Checkout Upload Functionality...\n');

  try {
    // Create a test image file
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-proof.png', testImageContent);

    // Create form data
    const formData = new FormData();
    formData.append('proof', fs.createReadStream('test-proof.png'), {
      filename: 'test-proof.png',
      contentType: 'image/png'
    });
    formData.append('customer_name', 'Test Customer');
    formData.append('customer_email', 'test@example.com');
    formData.append('amount', '50.00');
    formData.append('country', 'US');
    formData.append('payment_method_id', 'b5a74f1a-2d82-4f2d-9be8-0c95be761685'); // Bank Transfer
    formData.append('checkout_link_id', 'd3eadc16-f048-448a-873b-4453c1a5f968'); // Simple Payment

    console.log('📤 Submitting test payment...');

    // Submit the form
    const response = await fetch('http://localhost:3000/api/checkout/simple-payment/submit', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Upload failed!');
      console.log('📋 Error:', JSON.stringify(result, null, 2));
    }

    // Clean up test file
    fs.unlinkSync('test-proof.png');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    
    // Clean up test file if it exists
    try {
      fs.unlinkSync('test-proof.png');
    } catch (e) {
      // File doesn't exist, ignore
    }
  }
}

testCheckoutUpload(); 