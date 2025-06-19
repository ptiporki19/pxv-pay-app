const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testBlogUpload() {
  console.log('🧪 Testing Blog Image Upload API...\n');

  try {
    // Create a test image file
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-blog-upload.png', testImageContent);

    // Create form data
    const formData = new FormData();
    formData.append('image', fs.createReadStream('test-blog-upload.png'), {
      filename: 'test-blog-upload.png',
      contentType: 'image/png'
    });

    console.log('📤 Testing blog image upload via API...');

    // Note: In a real test, you'd need to include authentication headers
    // For now, this will test the API endpoint structure
    const response = await fetch('http://localhost:3000/api/blog/upload-image', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Upload failed (expected without auth)!');
      console.log('📋 Error:', JSON.stringify(result, null, 2));
      console.log('📋 Status:', response.status, response.statusText);
      
      // This is expected since we're not authenticated
      if (response.status === 401) {
        console.log('✅ Authentication check working correctly');
      }
    }

    // Clean up test file
    fs.unlinkSync('test-blog-upload.png');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    
    // Clean up test file if it exists
    try {
      fs.unlinkSync('test-blog-upload.png');
    } catch (e) {
      // File doesn't exist, ignore
    }
  }
}

testBlogUpload().then(() => process.exit(0)); 