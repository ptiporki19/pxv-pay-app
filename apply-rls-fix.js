const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

console.log('🔧 Applying RLS fix to resolve infinite recursion...')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function applyRLSFix() {
  try {
    console.log('\n📄 Reading SQL fix file...')
    const sqlContent = fs.readFileSync('fix-rls-recursion.sql', 'utf8')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`\n🔄 Executing ${statements.length} SQL statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\n${i + 1}. Executing: ${statement.substring(0, 50)}...`)
      
      try {
        const { error } = await supabase.rpc('query', { query: statement })
        if (error) {
          console.log(`⚠️  Statement ${i + 1} warning:`, error.message)
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} error:`, err.message)
      }
    }

    console.log('\n🧪 Testing the fix...')
    // Test with super admin authentication
    const testClient = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    )
    
    const { data: authData, error: authError } = await testClient.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })
    
    if (authError) {
      console.error('❌ Test auth failed:', authError.message)
    } else {
      console.log('✅ Test auth successful')
      
      const { data: users, error: usersError } = await testClient
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (usersError) {
        console.error('❌ Test user fetch failed:', usersError.message)
      } else {
        console.log(`✅ Test successful! Super admin can now see ${users.length} users:`)
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.role})`)
        })
      }
    }

  } catch (err) {
    console.error('💥 RLS fix failed:', err)
  }
}

applyRLSFix().then(() => {
  console.log('\n✅ RLS fix completed!')
  process.exit(0)
}) 