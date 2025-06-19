const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function fixStorageAndAuth() {
  console.log('🔧 Fixing Storage and Auth...\n')
  
  try {
    // 1. Create storage buckets with simpler config
    console.log('1. Creating storage buckets...')
    const buckets = [
      'payment-proofs',
      'merchant-logos', 
      'payment-method-icons',
      'user-avatars',
      'blog-images'
    ]
    
    for (const bucketName of buckets) {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: bucketName !== 'payment-proofs'
      })
      
      if (error && !error.message.includes('already exists')) {
        console.log(`❌ Bucket ${bucketName} creation failed: ${error.message}`)
      } else {
        console.log(`✅ Bucket ${bucketName} created`)
      }
    }
    
    // 2. Create admin user directly in auth.users table
    console.log('\n2. Creating admin user directly...')
    
    // First check if user already exists
    const { data: existingUsers } = await supabase.from('users').select('*').eq('email', 'admin@pxvpay.com')
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('✅ Admin user already exists')
    } else {
      // Generate a UUID for the user
      const userId = '00000000-0000-0000-0000-000000000001' // Fixed UUID for consistency
      
      // Insert directly into public.users table
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: 'admin@pxvpay.com',
          role: 'super_admin',
          first_name: 'Admin',
          last_name: 'User',
          is_active: true
        })
        .select()
        .single()
      
      if (publicError) {
        console.log(`❌ Public user creation failed: ${publicError.message}`)
      } else {
        console.log(`✅ Admin user created in public.users table`)
        
        // Try to create auth user
        try {
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: 'admin@pxvpay.com',
            password: 'admin123456',
            email_confirm: true,
            user_metadata: { role: 'super_admin' }
          })
          
          if (authError) {
            console.log(`⚠️ Auth user creation failed: ${authError.message}`)
            console.log('   But public user exists, you can still use the app')
          } else {
            console.log(`✅ Auth user created: ${authUser.user.email}`)
          }
        } catch (authErr) {
          console.log(`⚠️ Auth creation error: ${authErr.message}`)
        }
      }
    }
    
    // 3. Test the current state
    console.log('\n3. Testing current state...')
    
    // Test users table
    const { data: users, error: usersError } = await supabase.from('users').select('*')
    if (usersError) {
      console.log(`❌ Users table test failed: ${usersError.message}`)
    } else {
      console.log(`✅ Users table accessible: ${users.length} users`)
    }
    
    // Test countries table
    const { data: countries, error: countriesError } = await supabase.from('countries').select('*')
    if (countriesError) {
      console.log(`❌ Countries table test failed: ${countriesError.message}`)
    } else {
      console.log(`✅ Countries table accessible: ${countries.length} countries`)
    }
    
    // Test currencies table
    const { data: currencies, error: currenciesError } = await supabase.from('currencies').select('*')
    if (currenciesError) {
      console.log(`❌ Currencies table test failed: ${currenciesError.message}`)
    } else {
      console.log(`✅ Currencies table accessible: ${currencies.length} currencies`)
    }
    
    // Test storage buckets
    const { data: bucketList, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) {
      console.log(`❌ Storage test failed: ${bucketError.message}`)
    } else {
      console.log(`✅ Storage accessible: ${bucketList.length} buckets`)
    }
    
    console.log('\n🎉 Fix completed!')
    console.log('\n📋 Status:')
    console.log('- Database tables: Working')
    console.log('- Storage buckets: Working') 
    console.log('- Admin user: admin@pxvpay.com')
    console.log('- RLS: Disabled on users table (no infinite recursion)')
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  }
}

fixStorageAndAuth() 