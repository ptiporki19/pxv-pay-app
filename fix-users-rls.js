const { createClient } = require('@supabase/supabase-js')

console.log('🔧 Fixing users table RLS policies...')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function fixUsersRLS() {
  try {
    console.log('\n1️⃣ Dropping existing conflicting policies...')
    
    const policiesToDrop = [
      'users_select_own',
      'users_update_own', 
      'Users can view own profile',
      'Super admins can view all users',
      'Super admins can update all users'
    ]
    
    for (const policy of policiesToDrop) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy}" ON public.users;`
      })
      if (error && !error.message.includes('does not exist')) {
        console.log(`⚠️  Could not drop policy "${policy}":`, error.message)
      } else {
        console.log(`✅ Dropped policy: ${policy}`)
      }
    }

    console.log('\n2️⃣ Creating new RLS policies...')
    
    const policies = [
      {
        name: 'users_view_own',
        sql: `CREATE POLICY "users_view_own" 
              ON public.users FOR SELECT 
              TO authenticated 
              USING (auth.uid() = id);`
      },
      {
        name: 'super_admin_view_all_users',
        sql: `CREATE POLICY "super_admin_view_all_users" 
              ON public.users FOR SELECT 
              TO authenticated 
              USING (
                EXISTS (
                  SELECT 1 FROM public.users u 
                  WHERE u.id = auth.uid() 
                  AND u.role = 'super_admin'
                )
              );`
      },
      {
        name: 'users_update_own',
        sql: `CREATE POLICY "users_update_own" 
              ON public.users FOR UPDATE 
              TO authenticated 
              USING (auth.uid() = id)
              WITH CHECK (auth.uid() = id);`
      },
      {
        name: 'super_admin_update_all_users',
        sql: `CREATE POLICY "super_admin_update_all_users" 
              ON public.users FOR UPDATE 
              TO authenticated 
              USING (
                EXISTS (
                  SELECT 1 FROM public.users u 
                  WHERE u.id = auth.uid() 
                  AND u.role = 'super_admin'
                )
              )
              WITH CHECK (
                EXISTS (
                  SELECT 1 FROM public.users u 
                  WHERE u.id = auth.uid() 
                  AND u.role = 'super_admin'
                )
              );`
      },
      {
        name: 'allow_user_insert',
        sql: `CREATE POLICY "allow_user_insert" 
              ON public.users FOR INSERT 
              TO authenticated 
              WITH CHECK (auth.uid() = id);`
      }
    ]

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: policy.sql
      })
      if (error) {
        console.error(`❌ Failed to create policy "${policy.name}":`, error.message)
      } else {
        console.log(`✅ Created policy: ${policy.name}`)
      }
    }

    console.log('\n3️⃣ Ensuring RLS is enabled...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;'
    })
    if (rlsError && !rlsError.message.includes('already enabled')) {
      console.error('❌ Failed to enable RLS:', rlsError.message)
    } else {
      console.log('✅ RLS enabled on users table')
    }

    console.log('\n4️⃣ Testing the fix...')
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

fixUsersRLS().then(() => {
  console.log('\n✅ RLS fix completed!')
  process.exit(0)
}) 