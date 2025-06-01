const { createClient } = require('@supabase/supabase-js');

async function fixStorageBucket() {
  console.log('🗄️ Fixing Storage Bucket Access...\n');

  try {
    // Create service role client
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Check if bucket exists
    console.log('1️⃣ Checking payment-proofs bucket...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Error listing buckets:', listError);
      return;
    }

    const paymentProofsBucket = buckets.find(b => b.name === 'payment-proofs');
    if (paymentProofsBucket) {
      console.log('✅ payment-proofs bucket exists');
      console.log('   Public:', paymentProofsBucket.public || false);
      console.log('   ID:', paymentProofsBucket.id);
    } else {
      console.log('❌ payment-proofs bucket not found');
      return;
    }

    // Check if bucket is public
    if (!paymentProofsBucket.public) {
      console.log('\n2️⃣ Making bucket public...');
      
      const { data: updateData, error: updateError } = await supabase.storage
        .updateBucket('payment-proofs', { public: true });
      
      if (updateError) {
        console.log('❌ Error updating bucket:', updateError);
      } else {
        console.log('✅ Bucket updated to public');
      }
    } else {
      console.log('✅ Bucket is already public');
    }

    // Test public access
    console.log('\n3️⃣ Testing public access...');
    
    // List files in bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('payment-proofs')
      .list('', { limit: 3 });

    if (filesError) {
      console.log('❌ Error listing files:', filesError);
      return;
    }

    console.log(`✅ Found ${files.length} files in bucket`);
    
    if (files.length > 0) {
      // Test first file
      const firstFile = files[0];
      console.log(`📁 Testing file: ${firstFile.name}`);
      
      // Generate public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(firstFile.name);
      
      console.log(`🔗 Public URL: ${urlData.publicUrl}`);
      
      // Test URL accessibility
      const fetch = require('node-fetch');
      try {
        const response = await fetch(urlData.publicUrl);
        console.log(`📊 URL test: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log('✅ Public access working!');
        } else {
          console.log('❌ Public access failed');
        }
      } catch (fetchError) {
        console.log('❌ Fetch test failed:', fetchError.message);
      }
    }

    // Create storage policies if needed
    console.log('\n4️⃣ Checking storage policies...');
    
    // Note: Storage policies are typically managed via the Supabase dashboard
    // or SQL commands. They can't be easily created via the client library.
    console.log('ℹ️ Storage policies should be configured to allow public read access');
    console.log('ℹ️ If issues persist, check Supabase Dashboard > Storage > Settings');

    console.log('\n✅ Storage bucket fix completed!');

  } catch (error) {
    console.error('💥 Storage fix failed:', error.message);
  }
}

fixStorageBucket(); 