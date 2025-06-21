const { createClient } = require('@supabase/supabase-js');
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testCheckoutWorkflow() {
  console.log('🧪 Testing Complete Checkout Workflow...\n');

  try {
    // 1. First check if we have test data
    console.log('1️⃣ Checking test data availability...');
    
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Check for test checkout link
    const { data: checkoutLinks, error: linkError } = await supabase
      .from('checkout_links')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (linkError || !checkoutLinks || checkoutLinks.length === 0) {
      console.log('❌ No active checkout links found');
      return;
    }

    const testCheckoutLink = checkoutLinks[0];
    console.log('✅ Found test checkout link:', testCheckoutLink.slug);

    // Check for test payment method
    const { data: paymentMethods, error: methodError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('status', 'active')
      .contains('countries', [testCheckoutLink.active_country_codes[0]])
      .limit(1);

    if (methodError || !paymentMethods || paymentMethods.length === 0) {
      console.log('❌ No active payment methods found for country:', testCheckoutLink.active_country_codes[0]);
      return;
    }

    const testPaymentMethod = paymentMethods[0];
    console.log('✅ Found test payment method:', testPaymentMethod.name);

    // 2. Test API endpoints
    console.log('\n2️⃣ Testing API endpoints...');
    
    // Test validate endpoint
    const validateResponse = await fetch(`http://localhost:3000/api/checkout/${testCheckoutLink.slug}/validate`);
    const validateData = await validateResponse.json();
    
    if (!validateResponse.ok || !validateData.valid) {
      console.log('❌ Checkout validation failed:', validateData);
      return;
    }
    console.log('✅ Checkout validation passed');

    // Test countries endpoint
    const countriesResponse = await fetch(`http://localhost:3000/api/checkout/${testCheckoutLink.slug}/countries`);
    const countriesData = await countriesResponse.json();
    
    if (!countriesResponse.ok || !countriesData.countries) {
      console.log('❌ Countries fetch failed:', countriesData);
      return;
    }
    console.log('✅ Countries fetch passed, count:', countriesData.countries.length);

    // Test payment methods endpoint
    const methodsResponse = await fetch(`http://localhost:3000/api/checkout/${testCheckoutLink.slug}/methods?country=${testCheckoutLink.active_country_codes[0]}`);
    const methodsData = await methodsResponse.json();
    
    if (!methodsResponse.ok || !methodsData.payment_methods) {
      console.log('❌ Payment methods fetch failed:', methodsData);
      return;
    }
    console.log('✅ Payment methods fetch passed, count:', methodsData.payment_methods.length);

    // 3. Test proof upload
    console.log('\n3️⃣ Testing proof upload...');
    
    // Create test image file
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-proof-upload.png', testImageBuffer);

    // Create form data
    const formData = new FormData();
    formData.append('proof', fs.createReadStream('test-proof-upload.png'), {
      filename: 'test-proof.png',
      contentType: 'image/png'
    });
    formData.append('customer_name', 'Test Customer');
    formData.append('customer_email', 'test@example.com');
    formData.append('amount', testCheckoutLink.amount_type === 'fixed' ? testCheckoutLink.amount.toString() : '50.00');
    formData.append('country', testCheckoutLink.active_country_codes[0]);
    formData.append('payment_method_id', testPaymentMethod.id);
    formData.append('checkout_link_id', testCheckoutLink.id);

    // Submit proof upload
    const submitResponse = await fetch(`http://localhost:3000/api/checkout/${testCheckoutLink.slug}/submit`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const submitData = await submitResponse.json();
    
    if (!submitResponse.ok) {
      console.log('❌ Proof upload failed:', submitData);
      // Clean up
      fs.unlinkSync('test-proof-upload.png');
      return;
    }

    console.log('✅ Proof upload successful!');
    console.log('💾 Payment ID:', submitData.payment_id);

    // 4. Verify payment record was created
    console.log('\n4️⃣ Verifying payment record...');
    
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', submitData.payment_id)
      .single();

    if (paymentError || !payment) {
      console.log('❌ Payment record not found:', paymentError);
    } else {
      console.log('✅ Payment record found:', {
        id: payment.id,
        customer: payment.customer_name,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        has_proof_url: !!payment.payment_proof_url
      });
    }

    // 5. Clean up test data
    console.log('\n5️⃣ Cleaning up...');
    
    if (payment) {
      await supabase.from('payments').delete().eq('id', payment.id);
      console.log('✅ Payment record cleaned up');
      
      // Clean up uploaded file
      if (payment.payment_proof_url) {
        const urlParts = payment.payment_proof_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${payment.merchant_id}/${fileName}`;
        
        await supabase.storage.from('payment-proofs').remove([filePath]);
        console.log('✅ Uploaded file cleaned up');
      }
    }
    
    fs.unlinkSync('test-proof-upload.png');
    console.log('✅ Local test file cleaned up');

    console.log('\n🎉 Complete checkout workflow test passed!');

  } catch (error) {
    console.error('💥 Workflow test failed:', error);
    
    // Clean up test file if it exists
    try {
      fs.unlinkSync('test-proof-upload.png');
    } catch (e) {
      // File doesn't exist, ignore
    }
  }
}

testCheckoutWorkflow().then(() => process.exit(0)); 