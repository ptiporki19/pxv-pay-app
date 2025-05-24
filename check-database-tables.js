const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabaseTables() {
  console.log('🔍 Checking Database Tables...\n')
  
  const requiredTables = [
    'users',
    'notifications', 
    'payments',
    'payment_methods',
    'countries',
    'currencies',
    'theme_content',
    'blog_posts'
  ]
  
  console.log('📊 Required Tables Check:')
  console.log('═'.repeat(40))
  
  const tableStatus = {}
  
  for (const table of requiredTables) {
    try {
      // Try to query the table to see if it exists
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        if (error.message.includes('does not exist') || error.code === 'PGRST106') {
          console.log(`❌ ${table} (MISSING)`)
          tableStatus[table] = { exists: false, error: error.message }
        } else {
          console.log(`⚠️  ${table} (EXISTS but has error: ${error.message})`)
          tableStatus[table] = { exists: true, error: error.message }
        }
      } else {
        console.log(`✅ ${table} (EXISTS - ${data?.length || 0} records)`)
        tableStatus[table] = { exists: true, count: data?.length || 0 }
      }
    } catch (error) {
      console.log(`❌ ${table} (ERROR: ${error.message})`)
      tableStatus[table] = { exists: false, error: error.message }
    }
  }
  
  const missingTables = Object.keys(tableStatus).filter(table => !tableStatus[table].exists)
  
  if (missingTables.length > 0) {
    console.log('\n🚨 Missing Tables Found:')
    console.log('═'.repeat(40))
    missingTables.forEach(table => {
      console.log(`❌ ${table}: ${tableStatus[table].error}`)
    })
    
    console.log('\n💡 Need to create missing tables')
  } else {
    console.log('\n🎉 All required tables exist!')
  }
  
  // Test specific functionality that's failing
  console.log('\n🧪 Testing Auth Flow:')
  console.log('═'.repeat(40))
  
  // Test users table specifically
  if (tableStatus.users?.exists) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, role, created_at')
        .limit(5)
      
      if (error) {
        console.log(`❌ Users query failed: ${error.message}`)
      } else {
        console.log(`✅ Users table accessible: ${users.length} users found`)
        if (users.length > 0) {
          console.log('   Sample user roles:', users.map(u => u.role || 'no_role').join(', '))
        }
      }
    } catch (error) {
      console.log(`❌ Users table test failed: ${error.message}`)
    }
  }
  
  // Test notifications table specifically  
  if (tableStatus.notifications?.exists) {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('id, title, type')
        .limit(3)
      
      if (error) {
        console.log(`❌ Notifications query failed: ${error.message}`)
      } else {
        console.log(`✅ Notifications table accessible: ${notifications.length} notifications found`)
      }
    } catch (error) {
      console.log(`❌ Notifications table test failed: ${error.message}`)
    }
  }
  
  console.log('\n🔐 Next Steps:')
  console.log('═'.repeat(40))
  if (missingTables.includes('users')) {
    console.log('1. Create users table with proper schema')
  }
  if (missingTables.includes('notifications')) {
    console.log('2. Create notifications table')
  }
  if (missingTables.includes('payments')) {
    console.log('3. Create payments table')
  }
  
  if (missingTables.length === 0) {
    console.log('✅ Database appears ready - check RLS policies if auth still fails')
  }
}

checkDatabaseTables() 