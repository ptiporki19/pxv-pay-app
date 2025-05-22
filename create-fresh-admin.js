// Script to create a fresh super admin user for PXV Pay
const { createClient } = require('@supabase/supabase-js');

// Local Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createFreshSuperAdmin() {
  console.log('🔧 Creating fresh Super Admin user for PXV Pay...\n');
  
  try {
    // 1. Delete existing user if exists (to start fresh)
    console.log('🗑️  Cleaning up existing dev-admin user...');
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const devAdmin = existingUser.users?.find(u => u.email === 'dev-admin@pxvpay.com');
    
    if (devAdmin) {
      await supabase.auth.admin.deleteUser(devAdmin.id);
      console.log('✅ Removed existing dev-admin user');
    }
    
    // 2. Create fresh super admin user
    console.log('👤 Creating new super admin user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'dev-admin@pxvpay.com',
      password: 'DevAdmin789',
      email_confirm: true,
      user_metadata: {
        full_name: 'Development Admin'
      }
    });
    
    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      return;
    }
    
    console.log('✅ Auth user created successfully!');
    console.log(`   User ID: ${newUser.user.id}`);
    console.log(`   Email: ${newUser.user.email}`);
    
    // 3. Set user role to super_admin in public.users table
    console.log('🔐 Setting super admin role...');
    const { error: roleError } = await supabase
      .from('users')
      .upsert({
        id: newUser.user.id,
        email: newUser.user.email,
        role: 'super_admin',
        active: true
      }, {
        onConflict: 'id'
      });
    
    if (roleError) {
      console.error('❌ Error setting role:', roleError.message);
      return;
    }
    
    console.log('✅ Super admin role set successfully!');
    
    // 4. Verify the setup
    console.log('\n🔍 Verifying user setup...');
    const { data: userRecord, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', newUser.user.id)
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching user record:', fetchError.message);
      return;
    }
    
    console.log('✅ User verification successful!');
    console.log('   ID:', userRecord.id);
    console.log('   Email:', userRecord.email);
    console.log('   Role:', userRecord.role);
    console.log('   Active:', userRecord.active);
    
    // 5. Print final credentials
    console.log('\n' + '='.repeat(50));
    console.log('🎉 FRESH SUPER ADMIN CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('');
    console.log('📧 Email:    dev-admin@pxvpay.com');
    console.log('🔑 Password: DevAdmin789');
    console.log('👑 Role:     super_admin');
    console.log('✅ Status:   active');
    console.log('');
    console.log('You can now test login with these credentials!');
    console.log('They should redirect you to /super-admin');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the script
createFreshSuperAdmin(); 