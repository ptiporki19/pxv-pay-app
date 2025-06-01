const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function checkUsersTable() {
  console.log('🔍 Checking Users Table')
  console.log('=======================')

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('❌ Error fetching users:', error.message)
    } else {
      console.log(`✅ Found ${users.length} users:`)
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id}) - ${user.role}`)
      })
    }

    // Check user_limits table too
    const { data: limits, error: limitsError } = await supabase
      .from('user_limits')
      .select('*')
      .order('created_at', { ascending: false })

    if (limitsError) {
      console.log('❌ Error fetching user limits:', limitsError.message)
    } else {
      console.log(`✅ Found ${limits.length} user limits:`)
      limits.forEach((limit, index) => {
        console.log(`   ${index + 1}. ${limit.user_id} - ${limit.user_role}`)
      })
    }

  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkUsersTable() 