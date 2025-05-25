const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function checkUsers() {
  try {
    const { data: users, error } = await supabase.from('users').select('*')
    
    if (error) {
      console.error('❌ Error fetching users:', error.message)
      return
    }
    
    console.log('📋 Current users in database:')
    users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id}, Role: ${user.role})`)
    })
    
    // Find non-admin user for testing
    const testUser = users.find(user => user.role !== 'super_admin')
    if (testUser) {
      console.log(`\n🧪 Test user for profile testing:`)
      console.log(`📧 Email: ${testUser.email}`)
      console.log(`👤 User ID: ${testUser.id}`)
      console.log(`🔗 Profile URL: http://localhost:3002/users/${testUser.id}/profile`)
    }
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

checkUsers()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 