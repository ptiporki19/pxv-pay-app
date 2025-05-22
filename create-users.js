// Script to create test users for PXV Pay using Supabase API
const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL and key from local Docker instance
const SUPABASE_URL = 'http://127.0.0.1:54321'; // Default local Supabase URL
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'; // Default local service role key

// Initialize Supabase client with admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createUsers() {
  console.log('Creating test users for PXV Pay...');
  
  try {
    // 1. Create Super Admin user
    console.log('Creating super admin user...');
    const { data: superAdminData, error: superAdminError } = await supabase.auth.admin.createUser({
      email: 'superadmin@pxvpay.com',
      password: 'SuperAdmin456',
      email_confirm: true,
    });
    
    if (superAdminError) {
      console.error('Error creating super admin user:', superAdminError.message);
    } else {
      console.log('Super admin user created successfully:', superAdminData.user.id);
      
      // Update the user role to super_admin
      const { error: roleUpdateError } = await supabase
        .from('users')
        .update({ role: 'super_admin' })
        .eq('id', superAdminData.user.id);
      
      if (roleUpdateError) {
        console.error('Error updating super admin role:', roleUpdateError.message);
      } else {
        console.log('Super admin role updated successfully');
      }
    }
    
    // 2. Create Merchant user
    console.log('\nCreating merchant user...');
    const { data: merchantData, error: merchantError } = await supabase.auth.admin.createUser({
      email: 'merchant@pxvpay.com',
      password: 'Merchant123',
      email_confirm: true,
    });
    
    if (merchantError) {
      console.error('Error creating merchant user:', merchantError.message);
    } else {
      console.log('Merchant user created successfully:', merchantData.user.id);
      // The trigger should automatically create a public.users record with registered_user role
    }
    
    // 3. Print user information
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .in('email', ['superadmin@pxvpay.com', 'merchant@pxvpay.com', 'admin@pxvpay.com']);
    
    if (usersError) {
      console.error('Error fetching users:', usersError.message);
    } else {
      console.log('\nCreated users:');
      console.table(users);
    }
    
    console.log('\nUser credentials:');
    console.log('====================');
    console.log('Super Admin User:');
    console.log('Email: superadmin@pxvpay.com');
    console.log('Password: SuperAdmin456');
    console.log('');
    console.log('Merchant User:');
    console.log('Email: merchant@pxvpay.com');
    console.log('Password: Merchant123');
    console.log('====================');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createUsers(); 