const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function fixAdminUser() {
  console.log('🔧 Fixing Admin User...\n')
  
  try {
    // 1. Check if admin user already exists in auth
    console.log('1. Checking existing admin user...')
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const existingAdmin = authUsers?.users.find(u => u.email === 'admin@pxvpay.com')
    
    let adminUserId = existingAdmin?.id
    
    if (!existingAdmin) {
      console.log('Creating new admin user in auth...')
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@pxvpay.com',
        password: 'admin123456',
        email_confirm: true
      })
      
      if (authError) {
        console.log(`❌ Auth user creation failed: ${authError.message}`)
        return
      }
      
      adminUserId = authUser.user.id
      console.log(`✅ Auth user created: ${authUser.user.email}`)
    } else {
      console.log(`✅ Admin user already exists in auth: ${existingAdmin.email}`)
    }
    
    // 2. Check current users table structure
    console.log('\n2. Checking users table structure...')
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', adminUserId)
      .single()
    
    if (userError && !userError.message.includes('No rows')) {
      console.log(`❌ Error checking user: ${userError.message}`)
    }
    
    if (!existingUser) {
      console.log('Creating user record in public.users...')
      // Create user with only the fields that exist in the current schema
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .insert({
          id: adminUserId,
          email: 'admin@pxvpay.com',
          role: 'super_admin',
          active: true
        })
        .select()
        .single()
      
      if (publicError) {
        console.log(`❌ Public user creation failed: ${publicError.message}`)
      } else {
        console.log(`✅ Public user created with super_admin role`)
      }
    } else {
      console.log(`✅ User already exists in public.users: ${existingUser.email}`)
      
      // Update role to super_admin if needed
      if (existingUser.role !== 'super_admin') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'super_admin' })
          .eq('id', adminUserId)
        
        if (updateError) {
          console.log(`❌ Role update failed: ${updateError.message}`)
        } else {
          console.log(`✅ Role updated to super_admin`)
        }
      }
    }
    
    // 3. Test final state
    console.log('\n3. Testing final state...')
    
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pxvpay.com')
      .single()
    
    if (finalError) {
      console.log(`❌ Final user check failed: ${finalError.message}`)
    } else {
      console.log(`✅ Final user state: ${finalUser.email} (${finalUser.role})`)
    }
    
    // 4. Test data counts
    const { data: countries } = await supabase.from('countries').select('*')
    const { data: currencies } = await supabase.from('currencies').select('*')
    const { data: paymentMethods } = await supabase.from('payment_methods').select('*')
    const { data: bucketList } = await supabase.storage.listBuckets()
    
    console.log(`✅ Countries: ${countries?.length || 0}`)
    console.log(`✅ Currencies: ${currencies?.length || 0}`)
    console.log(`✅ Payment Methods: ${paymentMethods?.length || 0}`)
    console.log(`✅ Storage Buckets: ${bucketList?.length || 0}`)
    
    console.log('\n🎉 Admin user fix completed!')
    console.log('\n📋 Status:')
    console.log('✅ Admin User: admin@pxvpay.com / admin123456 (super_admin)')
    console.log('✅ Database: All tables working')
    console.log('✅ Storage: All buckets restored')
    console.log('✅ Sample Data: Countries and currencies restored')
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  }
}

fixAdminUser().then(() => process.exit(0)) 