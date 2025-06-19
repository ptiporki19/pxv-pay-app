const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function createSimpleBuckets() {
  console.log('🪣 Creating Storage Buckets...\n')
  
  const buckets = [
    { name: 'payment-proofs', public: false },
    { name: 'merchant-logos', public: true },
    { name: 'payment-method-icons', public: true },
    { name: 'user-avatars', public: false },
    { name: 'blog-images', public: true }
  ]
  
  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public
      })
      
      if (error && !error.message.includes('already exists')) {
        console.log(`❌ Bucket ${bucket.name}: ${error.message}`)
      } else {
        console.log(`✅ Bucket ${bucket.name} created (public: ${bucket.public})`)
      }
    } catch (err) {
      console.log(`❌ Bucket ${bucket.name}: ${err.message}`)
    }
  }
  
  // Test bucket listing
  console.log('\n📋 Checking created buckets...')
  const { data: bucketList, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.log(`❌ Failed to list buckets: ${listError.message}`)
  } else {
    console.log(`✅ Total buckets: ${bucketList.length}`)
    bucketList.forEach(bucket => {
      console.log(`   - ${bucket.name} (public: ${bucket.public})`)
    })
  }
}

createSimpleBuckets().then(() => process.exit(0)) 