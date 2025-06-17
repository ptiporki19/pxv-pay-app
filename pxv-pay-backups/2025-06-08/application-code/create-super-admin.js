const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role
const supabaseUrl = 'https://frdksqjaiuakkalebnzd.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperAdmin() {
  console.log('🔄 Creating super admin user...\n');
  
  try {
    // Step 1: Create auth user
    console.log('📝 Creating auth user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@pxvpay.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: {
        name: 'Super Admin'
      }
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Auth creation error:', authError);
      return false;
    }

    const userId = authUser?.user?.id;
    console.log('✅ Auth user created/exists:', userId);

    // Step 2: Create/update user in public.users table
    console.log('👤 Creating user profile...');
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'admin@pxvpay.com',
        role: 'super_admin',
        active: true
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('❌ User profile error:', userError);
      return false;
    }

    console.log('✅ User profile created/updated');

    // Step 3: Verify super admin exists
    console.log('🔍 Verifying super admin...');
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pxvpay.com')
      .single();

    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
      return false;
    }

    console.log('✅ Super admin verified:', {
      id: verifyUser.id,
      email: verifyUser.email,
      role: verifyUser.role,
      active: verifyUser.active
    });

    console.log('\n🎉 SUPER ADMIN CREATED SUCCESSFULLY! 🎉');
    console.log('');
    console.log('Login Credentials:');
    console.log('📧 Email: admin@pxvpay.com');
    console.log('🔑 Password: admin123456');
    console.log('');
    console.log('🚀 You can now login with these credentials!');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the function
createSuperAdmin().then(success => {
  if (success) {
    console.log('\n✅ All done!');
  } else {
    console.log('\n❌ Failed to create super admin');
  }
  process.exit(success ? 0 : 1);
}); 