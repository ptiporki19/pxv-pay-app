const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
const fs = require('fs');

async function testFileUploadDirect() {
  console.log('📤 Testing Direct File Upload and Payment Creation...\n');

  try {
    // Create service role client
    const serviceSupabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Create a test image file (same as API test)
    console.log('1️⃣ Creating test image file...');
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-proof-direct.png', testImageContent);

    // Upload file to storage (same as API does)
    console.log('2️⃣ Uploading file to storage...');
    const fileExtension = 'png';
    const fileName = `${randomUUID()}.${fileExtension}`;
    const filePath = `00000000-0000-0000-0000-000000000001/${fileName}`;

    const fileBuffer = fs.readFileSync('test-proof-direct.png');
    
    const { error: uploadError } = await serviceSupabase.storage
      .from('payment-proofs')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/png'
      });

    if (uploadError) {
      console.error('❌ File upload error:', uploadError);
      return;
    }
    console.log('✅ File uploaded to:', filePath);

    // Get public URL
    const { data: urlData } = serviceSupabase.storage
      .from('payment-proofs')
      .getPublicUrl(filePath);

    console.log('3️⃣ File URL:', urlData.publicUrl);

    // Create payment record (same as API does)
    console.log('4️⃣ Creating payment record...');
    const paymentId = randomUUID();
    const paymentData = {
      id: paymentId,
      merchant_id: '00000000-0000-0000-0000-000000000001',
      checkout_link_id: 'a9d18b1c-5b50-4a73-9121-1e907478a495',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      amount: 50.00,
      currency: 'USD',
      country: 'US',
      payment_method: 'Bank Transfer',
      payment_proof_url: urlData.publicUrl,
      status: 'pending_verification',
      created_at: new Date().toISOString()
    };

    const { data: payment, error: paymentError } = await serviceSupabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.error('❌ Payment creation error:', paymentError);
      
      // Clean up uploaded file
      await serviceSupabase.storage
        .from('payment-proofs')
        .remove([filePath]);
      
      return;
    }

    console.log('✅ Payment created successfully!');
    console.log('💾 Payment ID:', payment.id);
    console.log('📊 Payment details:', {
      customer: payment.customer_name,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      proof_url: payment.payment_proof_url
    });

    // Clean up
    await serviceSupabase.from('payments').delete().eq('id', payment.id);
    await serviceSupabase.storage.from('payment-proofs').remove([filePath]);
    fs.unlinkSync('test-proof-direct.png');
    
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    
    // Clean up test file if it exists
    try {
      fs.unlinkSync('test-proof-direct.png');
    } catch (e) {
      // File doesn't exist, ignore
    }
  }
}

testFileUploadDirect(); 