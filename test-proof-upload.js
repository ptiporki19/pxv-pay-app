const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testProofUpload() {
  console.log('🧪 Testing Proof of Payment Upload...');
  
  try {
    // Create a simple test image file
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAWA0+PQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-receipt.png', testImageContent);
    
    // Create form data
    const formData = new FormData();
    formData.append('proof', fs.createReadStream('test-receipt.png'), {
      filename: 'test-receipt.png',
      contentType: 'image/png'
    });
    formData.append('customer_name', 'John Doe');
    formData.append('customer_email', 'john.doe@example.com');
    formData.append('amount', '5000');
    formData.append('country', 'CM');
    formData.append('payment_method_id', '81cc3587-2067-4208-baed-ac0996d22d37'); // Our test payment method
    formData.append('checkout_link_id', 'test-cameroon-payment-1749345333');
    
    console.log('📤 Submitting proof of payment...');
    
    const response = await fetch('http://localhost:3009/api/checkout/test-cameroon-payment-1749345333/submit', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const result = await response.text();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response body:', result);
    
    if (response.ok) {
      console.log('✅ Proof upload test PASSED');
      const data = JSON.parse(result);
      console.log('💳 Payment ID:', data.payment_id);
    } else {
      console.log('❌ Proof upload test FAILED');
      console.log('Error:', result);
    }
    
    // Clean up
    fs.unlinkSync('test-receipt.png');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testProofUpload(); 