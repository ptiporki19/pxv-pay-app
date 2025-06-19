const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function assessCurrentState() {
  console.log('🔍 DAMAGE ASSESSMENT AND RESTORATION PLAN')
  console.log('═'.repeat(60))
  console.log('⚠️  Assessing what was lost and needs restoration...\n')

  const results = {
    tables: {},
    users: {},
    policies: {},
    functions: {},
    issues: []
  }

  // Check all required tables
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

  console.log('📋 TABLE STATUS CHECK:')
  console.log('─'.repeat(40))

  for (const table of requiredTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
        results.tables[table] = { exists: false, error: error.message }
        results.issues.push(`Table ${table} has issues: ${error.message}`)
      } else {
        console.log(`✅ ${table}: EXISTS (${count} records)`)
        results.tables[table] = { exists: true, count: count }
      }
    } catch (error) {
      console.log(`❌ ${table}: FAILED - ${error.message}`)
      results.tables[table] = { exists: false, error: error.message }
      results.issues.push(`Table ${table} failed: ${error.message}`)
    }
  }

  // Check users specifically
  console.log('\n👥 USERS AND ROLES CHECK:')
  console.log('─'.repeat(40))

  if (results.tables.users?.exists) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, role, active, created_at')
        .order('created_at', { ascending: true })

      if (error) {
        console.log(`❌ Cannot read users: ${error.message}`)
        results.users = { accessible: false, error: error.message }
        results.issues.push(`Users table not accessible: ${error.message}`)
      } else {
        console.log(`✅ Users table accessible: ${users.length} users found`)
        
        const superAdmins = users.filter(u => u.role === 'super_admin')
        const admins = users.filter(u => u.role === 'admin')
        const regularUsers = users.filter(u => u.role === 'registered_user')

        console.log(`   Super Admins: ${superAdmins.length}`)
        console.log(`   Admins: ${admins.length}`)
        console.log(`   Regular Users: ${regularUsers.length}`)

        if (superAdmins.length === 0) {
          console.log(`❌ NO SUPER ADMINS FOUND - CRITICAL ISSUE`)
          results.issues.push('No super admins exist - need to create at least one')
        }

        results.users = {
          accessible: true,
          total: users.length,
          superAdmins: superAdmins.length,
          admins: admins.length,
          regularUsers: regularUsers.length,
          userList: users
        }
      }
    } catch (error) {
      console.log(`❌ Users query failed: ${error.message}`)
      results.users = { accessible: false, error: error.message }
      results.issues.push(`Users query failed: ${error.message}`)
    }
  }

  // Check auth functionality
  console.log('\n🔐 AUTH SYSTEM CHECK:')
  console.log('─'.repeat(40))

  try {
    // Test if we can create a user
    const testEmail = `test-${Date.now()}@example.com`
    const testId = crypto.randomUUID()

    const { data: testUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testId,
        email: testEmail,
        role: 'registered_user',
        active: true,
        created_at: new Date().toISOString()
      })
      .select()

    if (insertError) {
      console.log(`❌ User creation test failed: ${insertError.message}`)
      results.issues.push(`User creation broken: ${insertError.message}`)
    } else {
      console.log(`✅ User creation works`)
      
      // Clean up test user
      await supabase.from('users').delete().eq('id', testId)
    }
  } catch (error) {
    console.log(`❌ Auth test failed: ${error.message}`)
    results.issues.push(`Auth system test failed: ${error.message}`)
  }

  // Check notifications
  console.log('\n🔔 NOTIFICATIONS CHECK:')
  console.log('─'.repeat(40))

  if (results.tables.notifications?.exists && results.users?.accessible && results.users.userList?.length > 0) {
    try {
      const testUserId = results.users.userList[0].id
      
      const { data: notification, error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: testUserId,
          title: 'System Test',
          message: 'Testing notification system',
          type: 'info'
        })
        .select()

      if (notifError) {
        console.log(`❌ Notification creation failed: ${notifError.message}`)
        results.issues.push(`Notifications broken: ${notifError.message}`)
      } else {
        console.log(`✅ Notifications work`)
        
        // Clean up
        if (notification?.[0]) {
          await supabase.from('notifications').delete().eq('id', notification[0].id)
        }
      }
    } catch (error) {
      console.log(`❌ Notification test failed: ${error.message}`)
      results.issues.push(`Notification test failed: ${error.message}`)
    }
  }

  // Generate restoration plan
  console.log('\n📋 RESTORATION PLAN:')
  console.log('═'.repeat(60))

  if (results.issues.length === 0) {
    console.log('🎉 GOOD NEWS: No major issues found!')
    console.log('✅ All core tables exist and are accessible')
    console.log('✅ Users system is working')
    console.log('✅ Auth flow appears functional')
    
    if (results.users.superAdmins === 0) {
      console.log('\n⚠️  ACTION NEEDED: Create super admin user')
    } else {
      console.log('\n✅ System appears to be in good state')
    }
  } else {
    console.log('❌ ISSUES FOUND - RESTORATION NEEDED:')
    console.log('─'.repeat(40))
    
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`)
    })

    console.log('\n📝 RESTORATION STEPS:')
    console.log('─'.repeat(40))
    
    if (results.issues.some(i => i.includes('does not exist'))) {
      console.log('1. ❌ CRITICAL: Some tables are missing')
      console.log('   → Need to run clean migrations to restore tables')
    }
    
    if (results.issues.some(i => i.includes('No super admins'))) {
      console.log('2. 👤 Create super admin user for dashboard access')
    }
    
    if (results.issues.some(i => i.includes('Notifications'))) {
      console.log('3. 🔔 Fix notification system RLS policies')
    }
    
    if (results.issues.some(i => i.includes('Auth'))) {
      console.log('4. 🔐 Fix authentication flow')
    }
  }

  console.log('\n🔄 NEXT STEPS:')
  console.log('═'.repeat(60))
  console.log('1. Review this assessment')
  console.log('2. Confirm restoration approach with user')  
  console.log('3. Execute restoration plan step by step')
  console.log('4. Test each component after restoration')
  console.log('5. Verify original payment method issue is resolved')

  return results
}

// Run assessment
assessCurrentState()
  .then(results => {
    console.log('\n✅ Assessment complete!')
    console.log('📊 Run this script again after any fixes to verify progress')
  })
  .catch(error => {
    console.error('❌ Assessment failed:', error)
  }) 