const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function createSuperAdmin() {
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@pxvpay.com',
    password: 'admin123456',
    email_confirm: true
  })

  if (authError && !authError.message.includes('already registered')) {
    console.error('Auth error:', authError)
    return
  }

  console.log('✅ Super admin created/exists')
  
  setTimeout(async () => {
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'super_admin' })
      .eq('email', 'admin@pxvpay.com')

    if (!updateError) {
      console.log('✅ Role updated to super_admin')
    }
    process.exit(0)
  }, 1000)
}

createSuperAdmin()
