const { createClient } = require('@supabase/supabase-js')

console.log('🔍 Checking current users in database...')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function checkUsers() {
  try {
    console.log('\n📊 Checking auth.users table...')
    
    // Check auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
    } else {
      console.log(`✅ Found ${authUsers.users.length} users in auth.users:`)
      authUsers.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (ID: ${user.id.slice(0, 8)}...)`)
      })
    }
    
    console.log('\n📊 Checking public.users table...')
    
    // Check public.users
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (publicError) {
      console.error('❌ Error fetching public users:', publicError)
    } else {
      console.log(`✅ Found ${publicUsers.length} users in public.users:`)
      publicUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (Role: ${user.role}, Active: ${user.active}, ID: ${user.id.slice(0, 8)}...)`)
      })
    }
    
    console.log('\n🔄 Checking sync status...')
    
    if (authUsers && publicUsers) {
      const authUserIds = new Set(authUsers.users.map(u => u.id))
      const publicUserIds = new Set(publicUsers.map(u => u.id))
      
      const missingInPublic = authUsers.users.filter(u => !publicUserIds.has(u.id))
      const missingInAuth = publicUsers.filter(u => !authUserIds.has(u.id))
      
      if (missingInPublic.length > 0) {
        console.log('⚠️  Users in auth.users but missing from public.users:')
        missingInPublic.forEach(user => {
          console.log(`   - ${user.email} (${user.id.slice(0, 8)}...)`)
        })
      }
      
      if (missingInAuth.length > 0) {
        console.log('⚠️  Users in public.users but missing from auth.users:')
        missingInAuth.forEach(user => {
          console.log(`   - ${user.email} (${user.id.slice(0, 8)}...)`)
        })
      }
      
      if (missingInPublic.length === 0 && missingInAuth.length === 0) {
        console.log('✅ All users are properly synced between auth.users and public.users')
      }
    }
    
  } catch (err) {
    console.error('❌ Check failed:', err)
  }
}

checkUsers().then(() => {
  console.log('\n✅ User check completed!')
  process.exit(0)
}) 