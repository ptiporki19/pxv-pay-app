const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function createAdminSimple() {
  console.log('👤 Creating Admin User...\n')
  
  try {
    // 1. Create admin user in auth
    console.log('1. Creating admin user in auth...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@pxvpay.com',
      password: 'admin123456',
      email_confirm: true
    })
    
    if (authError) {
      console.log(`❌ Auth user creation failed: ${authError.message}`)
      // Try to continue anyway in case user already exists
    } else {
      console.log(`✅ Auth user created: ${authUser.user.email}`)
    }
    
    // 2. Add sample data
    console.log('\n2. Adding sample data...')
    
    // Get admin user ID (try to find existing or use new one)
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const adminUser = authUsers?.users.find(u => u.email === 'admin@pxvpay.com')
    const adminId = adminUser?.id || authUser?.user?.id
    
    if (adminId) {
      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: adminId,
          email: 'admin@pxvpay.com',
          role: 'super_admin',
          active: true
        })
      
      if (userError) {
        console.log(`❌ User record creation failed: ${userError.message}`)
      } else {
        console.log(`✅ User record created`)
      }
      
      // Add sample countries
      const countries = [
        { user_id: adminId, name: 'United States', code: 'US', status: 'active' },
        { user_id: adminId, name: 'United Kingdom', code: 'GB', status: 'active' },
        { user_id: adminId, name: 'Canada', code: 'CA', status: 'active' },
        { user_id: adminId, name: 'Nigeria', code: 'NG', status: 'active' }
      ]
      
      for (const country of countries) {
        const { error } = await supabase.from('countries').upsert(country)
        if (!error) {
          console.log(`✅ Country added: ${country.name}`)
        }
      }
      
      // Add sample currencies
      const currencies = [
        { user_id: adminId, name: 'US Dollar', code: 'USD', symbol: '$', status: 'active' },
        { user_id: adminId, name: 'British Pound', code: 'GBP', symbol: '£', status: 'active' },
        { user_id: adminId, name: 'Canadian Dollar', code: 'CAD', symbol: 'C$', status: 'active' },
        { user_id: adminId, name: 'Nigerian Naira', code: 'NGN', symbol: '₦', status: 'active' }
      ]
      
      for (const currency of currencies) {
        const { error } = await supabase.from('currencies').upsert(currency)
        if (!error) {
          console.log(`✅ Currency added: ${currency.name}`)
        }
      }
    }
    
    console.log('\n🎉 Setup completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Admin User: admin@pxvpay.com / admin123456')
    console.log('✅ Sample countries and currencies added')
    console.log('✅ Ready for Phase 2 development')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

createAdminSimple().then(() => process.exit(0)) 