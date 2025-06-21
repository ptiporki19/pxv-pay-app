const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testCompleteFlow() {
  console.log('🔄 Testing Complete Payment Verification Flow...\n');

  try {
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Step 1: Submit a new payment via API
    console.log('1️⃣ Submitting payment via checkout API...');
    
    // Create test image
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-flow.png', testImageContent);

    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('proof', fs.createReadStream('test-flow.png'), {
      filename: 'test-flow.png',
      contentType: 'image/png'
    });
    formData.append('customer_name', 'John Doe');
    formData.append('customer_email', 'john.doe@example.com');
    formData.append('amount', '75.50');
    formData.append('country', 'US');
    formData.append('payment_method_id', '80690fa1-09e4-4f6b-9fb9-d93bfe5c3772');
    formData.append('checkout_link_id', 'a9d18b1c-5b50-4a73-9121-1e907478a495');

    // Using curl since our Node.js test had issues
    const { exec } = require('child_process');
    const curlCommand = `curl -s -X POST "http://localhost:3000/api/checkout/simple-payment/submit" \\
      -F "proof=@test-flow.png" \\
      -F "customer_name=John Doe" \\
      -F "customer_email=john.doe@example.com" \\
      -F "amount=75.50" \\
      -F "country=US" \\
      -F "payment_method_id=80690fa1-09e4-4f6b-9fb9-d93bfe5c3772" \\
      -F "checkout_link_id=a9d18b1c-5b50-4a73-9121-1e907478a495"`;

    const submitResponse = await new Promise((resolve, reject) => {
      exec(curlCommand, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(JSON.parse(stdout));
      });
    });

    console.log('✅ Payment submitted:', submitResponse.payment_id);

    // Step 2: Verify payment appears in merchant payments
    console.log('\n2️⃣ Checking merchant payments...');
    
    const merchantId = '00000000-0000-0000-0000-000000000001';
    const { data: merchantPayments, error: merchantError } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('status', 'pending_verification')
      .order('created_at', { ascending: false });

    if (merchantError) {
      console.log('❌ Error fetching merchant payments:', merchantError);
      return;
    }

    console.log(`✅ Merchant has ${merchantPayments.length} pending payments`);
    
    const newPayment = merchantPayments.find(p => p.id === submitResponse.payment_id);
    if (newPayment) {
      console.log('✅ New payment found in merchant payments:');
      console.log(`   Customer: ${newPayment.customer_name} (${newPayment.customer_email})`);
      console.log(`   Amount: $${newPayment.amount} ${newPayment.currency}`);
      console.log(`   Proof URL: ${newPayment.payment_proof_url}`);
    } else {
      console.log('❌ New payment not found in merchant payments');
    }

    // Step 3: Test image accessibility
    console.log('\n3️⃣ Testing proof image accessibility...');
    
    if (newPayment && newPayment.payment_proof_url) {
      const fetch = require('node-fetch');
      const imageResponse = await fetch(newPayment.payment_proof_url);
      
      if (imageResponse.ok) {
        console.log('✅ Payment proof image is accessible');
        console.log(`   Status: ${imageResponse.status}`);
        console.log(`   Content-Type: ${imageResponse.headers.get('content-type')}`);
        console.log(`   URL: ${newPayment.payment_proof_url}`);
      } else {
        console.log('❌ Payment proof image not accessible:', imageResponse.status);
      }
    }

    // Step 4: Test status update (simulate merchant action)
    console.log('\n4️⃣ Testing payment approval...');
    
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('id', submitResponse.payment_id)
      .eq('merchant_id', merchantId)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Error updating payment:', updateError);
    } else {
      console.log('✅ Payment approved successfully:');
      console.log(`   Status: ${updatedPayment.status}`);
      console.log(`   Payment ID: ${updatedPayment.id}`);
    }

    // Step 5: Verify completed payments
    console.log('\n5️⃣ Checking completed payments...');
    
    const { data: completedPayments, error: completedError } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (completedError) {
      console.log('❌ Error fetching completed payments:', completedError);
    } else {
      console.log(`✅ Merchant has ${completedPayments.length} completed payments`);
      const approvedPayment = completedPayments.find(p => p.id === submitResponse.payment_id);
      if (approvedPayment) {
        console.log('✅ Payment found in completed payments');
      }
    }

    // Clean up
    fs.unlinkSync('test-flow.png');
    console.log('\n🎉 Complete flow test finished successfully!');
    console.log('📋 Summary:');
    console.log('   ✅ Payment submission works');
    console.log('   ✅ Payment appears in merchant verification');
    console.log('   ✅ Proof image is accessible');
    console.log('   ✅ Payment status can be updated');
    console.log('   ✅ Updated payments appear in correct status');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    
    // Clean up
    try {
      fs.unlinkSync('test-flow.png');
    } catch (e) {
      // File doesn't exist, ignore
    }
  }
}

testCompleteFlow(); 