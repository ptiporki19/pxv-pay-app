const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testStorageUpload() {
  console.log('🧪 Testing Storage Upload with Service Role...\n');

  try {
    // Create service role client
    const serviceSupabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Create a test image file
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-proof.png', testImageContent);

    // Test upload
    const filePath = `test-merchant/test-payment.png`;
    const fileBuffer = fs.readFileSync('test-proof.png');

    console.log('📤 Uploading test file...');
    const { data, error } = await serviceSupabase.storage
      .from('payment-proofs')
      .upload(filePath, fileBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.log('❌ Upload failed:', error.message);
    } else {
      console.log('✅ Upload successful!');
      console.log('📋 File path:', data.path);

      // Test getting public URL
      const { data: urlData } = serviceSupabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', urlData.publicUrl);

      // Clean up
      await serviceSupabase.storage
        .from('payment-proofs')
        .remove([filePath]);
      
      console.log('🧹 Test file cleaned up');
    }

    // Clean up local file
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

testStorageUpload(); 