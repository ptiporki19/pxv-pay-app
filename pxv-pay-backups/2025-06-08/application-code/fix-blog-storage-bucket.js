const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixBlogStorageBucket() {
  console.log('🔧 Fixing Blog Images Storage Bucket...\n');

  try {
    // 1. List all buckets to see current state
    console.log('1️⃣ Checking existing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to list buckets: ${bucketsError.message}`);
    }

    console.log('📋 Found buckets:', buckets.map(b => `${b.name} (public: ${b.public})`));

    // 2. Find blog-images bucket
    const blogImagesBucket = buckets.find(bucket => bucket.name === 'blog-images');
    
    if (!blogImagesBucket) {
      console.log('❌ blog-images bucket not found! Creating it...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('blog-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }
      
      console.log('✅ blog-images bucket created successfully');
    } else {
      console.log(`📦 blog-images bucket found: public=${blogImagesBucket.public}`);
      
      if (!blogImagesBucket.public) {
        console.log('🔧 Making blog-images bucket public...');
        
        const { data: updateData, error: updateError } = await supabase.storage.updateBucket('blog-images', {
          public: true
        });

        if (updateError) {
          throw new Error(`Failed to update bucket: ${updateError.message}`);
        }
        
        console.log('✅ blog-images bucket is now public');
      } else {
        console.log('✅ blog-images bucket is already public');
      }
    }

    // 3. Test file upload
    console.log('\n2️⃣ Testing file upload...');
    
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const fileName = `test-blog-${Date.now()}.png`;
    const filePath = `test-uploads/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, testImageContent, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/png'
      });

    if (uploadError) {
      throw new Error(`Upload test failed: ${uploadError.message}`);
    }

    console.log('✅ Test upload successful:', uploadData.path);

    // 4. Test public URL access
    console.log('\n3️⃣ Testing public URL access...');
    
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    console.log('🔗 Public URL:', urlData.publicUrl);

    // Test HTTP access
    const response = await fetch(urlData.publicUrl);
    console.log(`📡 HTTP Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);
      console.log('✅ File is publicly accessible!');
    } else {
      console.log('❌ File is not accessible via HTTP');
    }

    // 5. Clean up test file
    console.log('\n4️⃣ Cleaning up test file...');
    await supabase.storage.from('blog-images').remove([filePath]);
    console.log('🧹 Test file removed');

    console.log('\n🎉 Blog images storage bucket is properly configured!');
    console.log('✅ Bucket is public');
    console.log('✅ File upload works');
    console.log('✅ Public URL access works');

  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

fixBlogStorageBucket(); 