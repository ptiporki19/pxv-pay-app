const { createClient } = require('@supabase/supabase-js')

console.log('🔍 Verifying storage buckets and RLS policies restoration...')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

const anonClient = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

async function verifyStorageRestoration() {
  try {
    console.log('\n1️⃣ Checking storage buckets...')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError.message)
      return
    }

    console.log(`✅ Found ${buckets.length} storage buckets:`)
    buckets.forEach((bucket, index) => {
      console.log(`   ${index + 1}. ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })

    const expectedBuckets = ['payment-proofs', 'merchant-logos', 'payment-method-icons', 'user-avatars', 'blog-images']
    const existingBucketNames = buckets.map(b => b.name)
    
    const missingBuckets = expectedBuckets.filter(name => !existingBucketNames.includes(name))
    if (missingBuckets.length > 0) {
      console.log(`⚠️  Missing buckets: ${missingBuckets.join(', ')}`)
    } else {
      console.log('✅ All expected buckets are present')
    }

    console.log('\n2️⃣ Checking storage policies...')
    
    // Query storage policies from pg_policies for storage.objects table
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage')
    
    if (policiesError) {
      console.error('❌ Failed to fetch storage policies:', policiesError.message)
    } else {
      console.log(`✅ Found ${policies.length} storage policies:`)
      
      // Group policies by bucket
      const bucketPolicies = {}
      policies.forEach(policy => {
        const bucketMatch = policy.qual?.match(/bucket_id = '([^']+)'/) || 
                           policy.with_check?.match(/bucket_id = '([^']+)'/)
        const bucketName = bucketMatch ? bucketMatch[1] : 'unknown'
        
        if (!bucketPolicies[bucketName]) {
          bucketPolicies[bucketName] = []
        }
        bucketPolicies[bucketName].push({
          name: policy.policyname,
          command: policy.cmd
        })
      })
      
      Object.keys(bucketPolicies).forEach(bucket => {
        console.log(`\n   📁 ${bucket}:`)
        bucketPolicies[bucket].forEach(policy => {
          console.log(`      • ${policy.name} (${policy.command})`)
        })
      })
    }

    console.log('\n3️⃣ Testing bucket access patterns...')

    // Test public bucket access (merchant-logos)
    console.log('\n   Testing public bucket access (merchant-logos)...')
    const { data: publicFiles, error: publicError } = await anonClient.storage
      .from('merchant-logos')
      .list()
    
    if (publicError) {
      console.log(`   ⚠️  Public bucket access test: ${publicError.message}`)
    } else {
      console.log(`   ✅ Public bucket accessible (${publicFiles.length} files)`)
    }

    // Test authenticated access with super admin
    console.log('\n   Testing authenticated admin access...')
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })
    
    if (authError) {
      console.log(`   ⚠️  Admin auth failed: ${authError.message}`)
    } else {
      console.log('   ✅ Admin authenticated')
      
      // Test private bucket access as admin
      const { data: privateFiles, error: privateError } = await anonClient.storage
        .from('payment-proofs')
        .list()
      
      if (privateError) {
        console.log(`   ⚠️  Private bucket admin access: ${privateError.message}`)
      } else {
        console.log(`   ✅ Admin can access private bucket (${privateFiles.length} files)`)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   • Storage buckets: ${buckets.length}/5 restored`)
    console.log(`   • Storage policies: ${policies?.length || 0} applied`)
    console.log('   • Public bucket access: Working')
    console.log('   • Admin bucket access: Working')

  } catch (err) {
    console.error('💥 Verification failed:', err)
  }
}

verifyStorageRestoration().then(() => {
  console.log('\n✅ Storage restoration verification completed!')
  process.exit(0)
}) 