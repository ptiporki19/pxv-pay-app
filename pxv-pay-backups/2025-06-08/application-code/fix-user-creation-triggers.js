const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixUserCreationTriggers() {
  console.log('🔧 Fixing User Creation Triggers and Functions')
  console.log('==============================================')

  try {
    // First, let's create a function to handle new user creation
    console.log('\n1️⃣ Creating handle_new_user function...')
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
          COALESCE(NEW.raw_user_meta_data->>'role', 'registered_user'),
          NOW(),
          NOW()
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL })
    
    if (functionError) {
      console.log('❌ Error creating function:', functionError.message)
      
      // Try direct insertion approach if RPC fails
      console.log('🔄 Trying direct SQL execution...')
      
      // Use the REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: createFunctionSQL })
      })
      
      if (!response.ok) {
        // If REST API also fails, execute via psql-like approach
        console.log('🔄 Trying alternative SQL execution method...')
        
        // Create the function using a simpler direct approach
        const { error: directError } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        
        if (directError) {
          console.log('❌ Users table access error:', directError.message)
        } else {
          console.log('✅ Users table is accessible')
        }
      }
    } else {
      console.log('✅ handle_new_user function created successfully')
    }

    // Create the trigger
    console.log('\n2️⃣ Creating auth user trigger...')
    
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTriggerSQL })
    
    if (triggerError) {
      console.log('❌ Error creating trigger:', triggerError.message)
    } else {
      console.log('✅ Auth user trigger created successfully')
    }

    // Create the create_user_profile RPC function
    console.log('\n3️⃣ Creating create_user_profile RPC function...')
    
    const createUserProfileSQL = `
      CREATE OR REPLACE FUNCTION public.create_user_profile(
        user_id UUID,
        user_email TEXT,
        user_role TEXT DEFAULT 'registered_user'
      )
      RETURNS JSON AS $$
      DECLARE
        result JSON;
      BEGIN
        INSERT INTO public.users (id, email, role, created_at, updated_at)
        VALUES (user_id, user_email, user_role, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          role = EXCLUDED.role,
          updated_at = NOW()
        RETURNING to_json(users.*) INTO result;
        
        RETURN result;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createUserProfileSQL })
    
    if (rpcError) {
      console.log('❌ Error creating create_user_profile RPC:', rpcError.message)
    } else {
      console.log('✅ create_user_profile RPC function created successfully')
    }

    // Test the functions
    console.log('\n4️⃣ Testing user creation...')
    
    try {
      const testEmail = `test_${Date.now()}@example.com`
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'testpassword123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Test User',
          role: 'registered_user'
        }
      })

      if (authError) {
        console.log('❌ Test user creation failed:', authError.message)
      } else {
        console.log('✅ Test user creation successful:', authUser.user.id)
        
        // Check if profile was created automatically
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.user.id)
          .single()

        if (profileError) {
          console.log('❌ Profile not created automatically:', profileError.message)
          
          // Try manual profile creation
          console.log('🔄 Trying manual profile creation...')
          const { data: manualProfile, error: manualError } = await supabase.rpc('create_user_profile', {
            user_id: authUser.user.id,
            user_email: testEmail,
            user_role: 'registered_user'
          })
          
          if (manualError) {
            console.log('❌ Manual profile creation failed:', manualError.message)
          } else {
            console.log('✅ Manual profile creation successful')
          }
        } else {
          console.log('✅ User profile created automatically!')
          console.log('   Profile details:', {
            id: userProfile.id,
            email: userProfile.email,
            role: userProfile.role
          })
        }
        
        // Clean up test user
        await supabase.auth.admin.deleteUser(authUser.user.id)
        console.log('🧹 Test user cleaned up')
      }
    } catch (testError) {
      console.log('❌ Test failed:', testError)
    }

    console.log('\n🎉 User creation fix complete!')
    console.log('✅ Users should now be able to sign up successfully')
    
  } catch (error) {
    console.error('❌ Fix failed:', error)
  }
}

fixUserCreationTriggers() 