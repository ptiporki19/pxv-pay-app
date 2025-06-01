const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testPaymentSubmission() {
  console.log('🧪 Testing Payment Submission API...\n');

  try {
    // Create a test image file
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-proof.png', testImageContent);

    // Create FormData for the test
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('proof', fs.createReadStream('test-proof.png'), {
      filename: 'test-proof.png',
      contentType: 'image/png'
    });
    formData.append('customer_name', 'Test Customer');
    formData.append('customer_email', 'test@example.com');
    formData.append('amount', '50.00');
    formData.append('country', 'US');
    formData.append('payment_method_id', '80690fa1-09e4-4f6b-9fb9-d93bfe5c3772'); // Bank Transfer (correct ID)
    formData.append('checkout_link_id', 'a9d18b1c-5b50-4a73-9121-1e907478a495'); // Simple Payment (correct ID)

    console.log('📤 Submitting test payment...');

    // Submit the form to the API
    const response = await fetch('http://localhost:3000/api/checkout/simple-payment/submit', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Payment submission successful!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      
      // Verify the payment was created in the database
      const supabase = createClient(
        'http://127.0.0.1:54321',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
      );
      
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', result.payment_id)
        .single();
      
      if (payment) {
        console.log('💾 Payment record created:');
        console.log('   ID:', payment.id);
        console.log('   Customer:', payment.customer_name);
        console.log('   Amount:', payment.amount, payment.currency);
        console.log('   Status:', payment.status);
        console.log('   Payment Method:', payment.payment_method);
        console.log('   Proof URL:', payment.payment_proof_url);
      } else {
        console.log('❌ Payment record not found:', paymentError);
      }
      
    } else {
      console.log('❌ Payment submission failed!');
      console.log('📋 Error:', JSON.stringify(result, null, 2));
      console.log('📋 Status:', response.status, response.statusText);
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

testPaymentSubmission(); 