const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function restoreStorageBuckets() {
  const buckets = [
    { name: 'payment-proofs', options: { public: false, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], fileSizeLimit: 5242880 }},
    { name: 'merchant-logos', options: { public: true, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'], fileSizeLimit: 2097152 }},
    { name: 'payment-method-icons', options: { public: true, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'], fileSizeLimit: 1048576 }},
    { name: 'user-avatars', options: { public: false, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], fileSizeLimit: 2097152 }},
    { name: 'blog-images', options: { public: true, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], fileSizeLimit: 5242880 }}
  ]

  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket.name, bucket.options)
    if (error && !error.message.includes('already exists')) {
      console.error(`Error creating bucket ${bucket.name}:`, error)
    } else {
      console.log(`✅ Bucket ${bucket.name} created/exists`)
    }
  }
}

restoreStorageBuckets().then(() => process.exit(0))
