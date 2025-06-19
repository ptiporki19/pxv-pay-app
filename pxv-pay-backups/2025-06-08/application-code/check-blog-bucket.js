const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkBlogBucket() {
  console.log('🗄️ Checking Blog Images Bucket...\n');

  try {
    // Create both regular and service role clients
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOuoJuXMiQzqagU2-AVBN4TgOWqZYI-nN4Vw'
    );

    const serviceSupabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // List all buckets
    console.log('1️⃣ Listing all storage buckets...');
    const { data: buckets, error: listError } = await serviceSupabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Error listing buckets:', listError);
      return;
    }

    console.log(`✅ Found ${buckets.length} buckets:`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    // Check specifically for blog-images bucket
    const blogImagesBucket = buckets.find(b => b.name === 'blog-images');
    if (blogImagesBucket) {
      console.log('\n✅ blog-images bucket exists');
      console.log('   Public:', blogImagesBucket.public);
      console.log('   Size limit:', blogImagesBucket.file_size_limit);
      console.log('   Allowed types:', blogImagesBucket.allowed_mime_types);
    } else {
      console.log('\n❌ blog-images bucket missing - creating...');
      
      const { data: newBucket, error: createError } = await serviceSupabase.storage.createBucket('blog-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.log('❌ Error creating bucket:', createError);
      } else {
        console.log('✅ blog-images bucket created successfully');
      }
    }

    // Test upload with regular client (mimicking the blog form)
    console.log('\n2️⃣ Testing upload with regular client...');
    
    // Create a test image file
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-blog-image.png', testImageContent);
    
    const fileName = `test-${Date.now()}.png`;
    const filePath = `blog-posts/${fileName}`;
    const fileBuffer = fs.readFileSync('test-blog-image.png');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/png'
      });

    if (uploadError) {
      console.log('❌ Upload failed with regular client:', uploadError);
      
      // Try with service role client
      console.log('\n3️⃣ Trying upload with service role client...');
      const { data: serviceUploadData, error: serviceUploadError } = await serviceSupabase.storage
        .from('blog-images')
        .upload(filePath, fileBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/png'
        });

      if (serviceUploadError) {
        console.log('❌ Upload failed with service client too:', serviceUploadError);
      } else {
        console.log('✅ Upload successful with service client!');
        console.log('📋 File path:', serviceUploadData.path);

        // Get public URL
        const { data: urlData } = serviceSupabase.storage
          .from('blog-images')
          .getPublicUrl(filePath);

        console.log('🔗 Public URL:', urlData.publicUrl);

        // Clean up
        await serviceSupabase.storage.from('blog-images').remove([filePath]);
        console.log('🧹 Test file cleaned up');
      }
    } else {
      console.log('✅ Upload successful with regular client!');
      console.log('📋 File path:', uploadData.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', urlData.publicUrl);

      // Clean up
      await supabase.storage.from('blog-images').remove([filePath]);
      console.log('🧹 Test file cleaned up');
    }

    // Clean up local file
    fs.unlinkSync('test-blog-image.png');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    
    // Clean up test file if it exists
    try {
      fs.unlinkSync('test-blog-image.png');
    } catch (e) {
      // File doesn't exist, ignore
    }
  }
}

checkBlogBucket().then(() => process.exit(0)); 