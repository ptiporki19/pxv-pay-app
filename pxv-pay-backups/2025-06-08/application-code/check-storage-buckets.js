const { createClient } = require('@supabase/supabase-js');

async function checkStorageBuckets() {
  console.log('🗄️ Checking Storage Buckets...\n');

  try {
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('❌ Error listing buckets:', error);
      return;
    }

    console.log('✅ Available buckets:', buckets.length);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    // Check specifically for payment-proofs bucket
    const paymentProofsBucket = buckets.find(b => b.name === 'payment-proofs');
    if (paymentProofsBucket) {
      console.log('\n✅ payment-proofs bucket exists');
    } else {
      console.log('\n❌ payment-proofs bucket missing - creating...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('payment-proofs', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.log('❌ Error creating bucket:', createError);
      } else {
        console.log('✅ payment-proofs bucket created successfully');
      }
    }

  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

checkStorageBuckets(); 