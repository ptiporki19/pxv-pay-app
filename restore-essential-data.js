const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function restoreEssentialData() {
  console.log('🔄 Restoring Essential Data...\n')
  
  try {
    // 1. Create admin user in auth.users
    console.log('1. Creating admin user...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@pxvpay.com',
      password: 'admin123456',
      email_confirm: true
    })
    
    if (authError) {
      console.log(`❌ Auth user creation failed: ${authError.message}`)
    } else {
      console.log(`✅ Auth user created: ${authUser.user.email}`)
      
      // 2. Create user record in public.users
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
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
        console.log(`✅ Public user created with super_admin role`)
      }
    }
    
    // 3. Create storage buckets
    console.log('\n2. Creating storage buckets...')
    const buckets = [
      { name: 'payment-proofs', public: false },
      { name: 'merchant-logos', public: true },
      { name: 'payment-method-icons', public: true },
      { name: 'user-avatars', public: true },
      { name: 'blog-images', public: true }
    ]
    
    for (const bucket of buckets) {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (error && !error.message.includes('already exists')) {
        console.log(`❌ Bucket ${bucket.name} creation failed: ${error.message}`)
      } else {
        console.log(`✅ Bucket ${bucket.name} created (public: ${bucket.public})`)
      }
    }
    
    // 4. Add some sample data
    console.log('\n3. Adding sample currencies...')
    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' }
    ]
    
    const { data: currencyData, error: currencyError } = await supabase
      .from('currencies')
      .insert(currencies)
      .select()
    
    if (currencyError) {
      console.log(`❌ Currency creation failed: ${currencyError.message}`)
    } else {
      console.log(`✅ ${currencyData.length} currencies created`)
    }
    
    // 5. Add some sample countries
    console.log('\n4. Adding sample countries...')
    const countries = [
      { name: 'United States', code: 'US', currency_id: currencyData?.find(c => c.code === 'USD')?.id },
      { name: 'United Kingdom', code: 'GB', currency_id: currencyData?.find(c => c.code === 'GBP')?.id },
      { name: 'Nigeria', code: 'NG', currency_id: currencyData?.find(c => c.code === 'NGN')?.id },
      { name: 'Germany', code: 'DE', currency_id: currencyData?.find(c => c.code === 'EUR')?.id }
    ]
    
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .insert(countries)
      .select()
    
    if (countryError) {
      console.log(`❌ Country creation failed: ${countryError.message}`)
    } else {
      console.log(`✅ ${countryData.length} countries created`)
    }
    
    console.log('\n🎉 Essential data restoration completed!')
    console.log('\n📋 Summary:')
    console.log('- Admin user: admin@pxvpay.com / admin123456')
    console.log('- Storage buckets: 5 buckets created')
    console.log('- Sample currencies: 4 currencies added')
    console.log('- Sample countries: 4 countries added')
    
  } catch (error) {
    console.error('❌ Restoration failed:', error.message)
  }
}

restoreEssentialData() 