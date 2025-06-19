const { createClient } = require('@supabase/supabase-js');
const FormData = require('form-data');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');

async function createTestPDF() {
  console.log('📄 Creating test PDF file...');
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  
  page.drawText('PAYMENT PROOF - TEST DOCUMENT', {
    x: 50,
    y: 350,
    size: 20,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Transaction ID: TEST-12345', {
    x: 50,
    y: 300,
    size: 14,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Amount: $75.50', {
    x: 50,
    y: 280,
    size: 14,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Date: ' + new Date().toLocaleDateString(), {
    x: 50,
    y: 260,
    size: 14,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Status: COMPLETED', {
    x: 50,
    y: 240,
    size: 14,
    color: rgb(0, 0.7, 0),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('test-payment-proof.pdf', pdfBytes);
  console.log('✅ Test PDF created: test-payment-proof.pdf');
}

async function createTestImage() {
  console.log('🖼️ Creating test image file...');
  
  // Create a simple PNG image (1x1 pixel red)
  const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync('test-payment-proof.png', testImageContent);
  console.log('✅ Test image created: test-payment-proof.png');
}

async function testFileUpload(filename, fileType, description) {
  console.log(`\n📤 Testing ${description} upload...`);
  
  try {
    const formData = new FormData();
    formData.append('proof', fs.createReadStream(filename), {
      filename: filename,
      contentType: fileType
    });
    formData.append('customer_name', `Test Customer - ${description}`);
    formData.append('customer_email', 'test@example.com');
    formData.append('amount', '100.00');
    formData.append('country', 'US');
    formData.append('payment_method_id', '80690fa1-09e4-4f6b-9fb9-d93bfe5c3772');
    formData.append('checkout_link_id', 'a9d18b1c-5b50-4a73-9121-1e907478a495');

    const response = await fetch('http://localhost:3000/api/checkout/simple-payment/submit', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ ${description} upload successful!`);
      console.log(`💾 Payment ID: ${result.payment_id}`);
      return result.payment_id;
    } else {
      console.log(`❌ ${description} upload failed:`, result.error);
      return null;
    }
  } catch (error) {
    console.error(`💥 ${description} upload error:`, error.message);
    return null;
  }
}

async function verifyPaymentRecord(paymentId, expectedFileType) {
  console.log(`\n🔍 Verifying payment record: ${paymentId}`);
  
  try {
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      console.log('❌ Payment record not found:', error?.message);
      return false;
    }

    console.log('✅ Payment record found:', {
      id: payment.id,
      customer: payment.customer_name,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      has_proof_url: !!payment.payment_proof_url,
      proof_url: payment.payment_proof_url
    });

    // Test if the file is accessible
    if (payment.payment_proof_url) {
      console.log('🌐 Testing file accessibility...');
      
      try {
        const fileResponse = await fetch(payment.payment_proof_url);
        if (fileResponse.ok) {
          const contentType = fileResponse.headers.get('content-type');
          console.log('✅ File is accessible');
          console.log(`📋 Content-Type: ${contentType}`);
          console.log(`📏 File size: ${fileResponse.headers.get('content-length')} bytes`);
          
          // Verify file type matches expectation
          if (expectedFileType === 'image' && contentType?.startsWith('image/')) {
            console.log('✅ Image file type verified');
          } else if (expectedFileType === 'pdf' && contentType === 'application/pdf') {
            console.log('✅ PDF file type verified');
          } else {
            console.log(`⚠️ Unexpected content type. Expected: ${expectedFileType}, Got: ${contentType}`);
          }
        } else {
          console.log('❌ File is not accessible:', fileResponse.status, fileResponse.statusText);
        }
      } catch (fetchError) {
        console.log('❌ Error accessing file:', fetchError.message);
      }
    }

    return true;
  } catch (error) {
    console.error('💥 Error verifying payment record:', error.message);
    return false;
  }
}

async function testProofUploadAndVerification() {
  console.log('🧪 Testing Proof Upload and Verification System...\n');
  console.log('This test verifies:');
  console.log('• Image file upload and storage');
  console.log('• PDF file upload and storage');
  console.log('• Payment record creation');
  console.log('• File accessibility and viewing');
  console.log('• Type detection and validation\n');

  try {
    // 1. Create test files
    await createTestImage();
    await createTestPDF();

    // 2. Test image upload
    const imagePaymentId = await testFileUpload('test-payment-proof.png', 'image/png', 'Image');
    
    // 3. Test PDF upload
    const pdfPaymentId = await testFileUpload('test-payment-proof.pdf', 'application/pdf', 'PDF');

    // 4. Verify records
    if (imagePaymentId) {
      await verifyPaymentRecord(imagePaymentId, 'image');
    }

    if (pdfPaymentId) {
      await verifyPaymentRecord(pdfPaymentId, 'pdf');
    }

    // 5. Test file size limit (create a large file)
    console.log('\n📏 Testing file size limits...');
    console.log('Creating a large test file (>10MB)...');
    
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'a'); // 11MB file
    fs.writeFileSync('test-large-file.txt', largeBuffer);
    
    const largeFormData = new FormData();
    largeFormData.append('proof', fs.createReadStream('test-large-file.txt'), {
      filename: 'test-large-file.txt',
      contentType: 'text/plain'
    });
    largeFormData.append('customer_name', 'Test Customer - Large File');
    largeFormData.append('customer_email', 'test@example.com');
    largeFormData.append('amount', '50.00');
    largeFormData.append('country', 'US');
    largeFormData.append('payment_method_id', '80690fa1-09e4-4f6b-9fb9-d93bfe5c3772');
    largeFormData.append('checkout_link_id', 'a9d18b1c-5b50-4a73-9121-1e907478a495');

    const largeFileResponse = await fetch('http://localhost:3000/api/checkout/simple-payment/submit', {
      method: 'POST',
      body: largeFormData,
      headers: largeFormData.getHeaders()
    });

    const largeFileResult = await largeFileResponse.json();
    if (largeFileResponse.ok) {
      console.log('❌ Large file should have been rejected but was accepted');
    } else {
      console.log('✅ Large file properly rejected:', largeFileResult.error);
    }

    console.log('\n🎉 All tests completed!');
    console.log('\nTo verify the viewing functionality:');
    console.log('1. Open http://localhost:3000/verification in your browser');
    console.log('2. Look for the test payments you just created');
    console.log('3. Click "View Proof" to test the enhanced viewer');
    console.log('4. Verify that:');
    console.log('   • Images display with thumbnail and enlarge options');
    console.log('   • PDFs display in iframe with fallback options');
    console.log('   • Download and "Open in New Tab" buttons work');
    console.log('   • File type icons show correctly in the button');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    // Clean up test files
    console.log('\n🧹 Cleaning up test files...');
    try {
      fs.unlinkSync('test-payment-proof.png');
      fs.unlinkSync('test-payment-proof.pdf');
      fs.unlinkSync('test-large-file.txt');
      console.log('✅ Test files cleaned up');
    } catch (e) {
      console.log('⚠️ Some test files could not be cleaned up (they may not exist)');
    }
  }
}

// Run the test
testProofUploadAndVerification(); 