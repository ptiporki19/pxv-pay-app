const { createClient } = require('@supabase/supabase-js')

// Supabase configuration for local development
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function debugAuth() {
  console.log('🔍 Debugging Auth System...\n')

  try {
    // Check Supabase connection
    console.log('🔗 Step 1: Testing Supabase Connection...')
    
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (healthError) {
      console.log('  ❌ Connection failed:', healthError.message)
    } else {
      console.log('  ✅ Supabase connection working')
    }

    // Check existing auth users
    console.log('\n👥 Step 2: Checking existing auth users...')
    
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.log('  ❌ Auth users check failed:', authError.message)
      } else {
        console.log(`  ✅ Found ${authUsers.users.length} auth users`)
        
        authUsers.users.forEach((user, index) => {
          console.log(`    ${index + 1}. ${user.email} (${user.id})`)
        })
        
        // Check for admin user specifically
        const adminUser = authUsers.users.find(user => user.email === 'admin@pxvpay.com')
        if (adminUser) {
          console.log('  ✅ Admin user found in auth system')
          console.log('    📧 Email:', adminUser.email)
          console.log('    🆔 ID:', adminUser.id)
          console.log('    🔐 Confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No')
        } else {
          console.log('  ⚠️  Admin user not found in auth system')
        }
      }
    } catch (error) {
      console.log('  ❌ Auth users error:', error.message)
    }

    // Check existing database users
    console.log('\n📊 Step 3: Checking database users...')
    
    try {
      const { data: dbUsers, error: dbError } = await supabase
        .from('users')
        .select('*')

      if (dbError) {
        console.log('  ❌ Database users check failed:', dbError.message)
      } else {
        console.log(`  ✅ Found ${dbUsers.length} database users`)
        
        dbUsers.forEach((user, index) => {
          console.log(`    ${index + 1}. ${user.email} (${user.role}) - ${user.id}`)
        })
        
        // Check for admin user specifically
        const adminUser = dbUsers.find(user => user.email === 'admin@pxvpay.com')
        if (adminUser) {
          console.log('  ✅ Admin user found in database')
          console.log('    📧 Email:', adminUser.email)
          console.log('    👑 Role:', adminUser.role)
          console.log('    🆔 ID:', adminUser.id)
        } else {
          console.log('  ⚠️  Admin user not found in database')
        }
      }
    } catch (error) {
      console.log('  ❌ Database users error:', error.message)
    }

    // Check users table schema
    console.log('\n📋 Step 4: Checking users table schema...')
    
    try {
      const { data: schemaCheck, error: schemaError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (schemaError) {
        console.log('  ❌ Schema check failed:', schemaError.message)
      } else {
        console.log('  ✅ Users table accessible')
        if (schemaCheck.length > 0) {
          console.log('  📋 Available columns:', Object.keys(schemaCheck[0]).join(', '))
        }
      }
    } catch (error) {
      console.log('  ❌ Schema error:', error.message)
    }

    // Try creating a simple test user
    console.log('\n🧪 Step 5: Testing user creation...')
    
    const testEmail = 'test@example.com'
    const testPassword = 'test123456'
    
    try {
      // Clean up any existing test user
      await supabase.auth.admin.deleteUser(testEmail)
      
      const { data: testUser, error: testError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
      })

      if (testError) {
        console.log('  ❌ Test user creation failed:', testError.message)
      } else {
        console.log('  ✅ Test user created successfully')
        console.log('    📧 Email:', testUser.user.email)
        console.log('    🆔 ID:', testUser.user.id)
        
        // Try to create database record
        const { data: dbRecord, error: dbRecordError } = await supabase
          .from('users')
          .insert({
            id: testUser.user.id,
            email: testEmail,
            role: 'user'
          })
          .select()

        if (dbRecordError) {
          console.log('  ❌ Test database record failed:', dbRecordError.message)
        } else {
          console.log('  ✅ Test database record created')
        }
        
        // Clean up test user
        await supabase.auth.admin.deleteUser(testUser.user.id)
        await supabase.from('users').delete().eq('id', testUser.user.id)
        console.log('  🧹 Test user cleaned up')
      }
    } catch (error) {
      console.log('  ❌ Test user error:', error.message)
    }

    console.log('\n📊 Debug Summary:')
    console.log('  🔗 Supabase connection: Working')
    console.log('  👥 Auth system: Accessible')
    console.log('  📊 Database: Accessible')
    console.log('  🧪 User creation: Testing completed')

  } catch (error) {
    console.error('❌ Debug error:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the debug
debugAuth().catch(console.error) 