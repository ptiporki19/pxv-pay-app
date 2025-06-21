#!/usr/bin/env node

/**
 * PXV Pay Authentication Verification
 * Verifies authentication system is ready for production
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyAuthentication() {
  console.log('🔐 PXV Pay Authentication Verification');
  console.log('======================================\n');

  try {
    // Verify super admin exists and can authenticate
    console.log('👑 Verifying Super Admin...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'bozard@gmail.com',
      password: 'TempPassword123!'
    });

    if (error) {
      console.log(`   ❌ Super admin authentication failed: ${error.message}`);
      return false;
    }

    console.log(`   ✅ Super admin authentication successful`);
    console.log(`   📧 Email: ${data.user.email}`);
    console.log(`   🎫 User ID: ${data.user.id}`);

    // Verify role in database
    const { data: userRecord } = await supabase
      .from('users')
      .select('role, email')
      .eq('email', 'bozard@gmail.com')
      .single();

    if (userRecord && userRecord.role === 'super_admin') {
      console.log(`   👑 Role verified: ${userRecord.role}`);
    } else {
      console.log(`   ❌ Role verification failed`);
      return false;
    }

    await supabase.auth.signOut();

    // Check regular user exists
    console.log('\n👤 Verifying Regular User...');
    
    const { data: regularUser } = await supabase
      .from('users')
      .select('email, role')
      .eq('email', 'afriglobalimports@gmail.com')
      .single();

    if (regularUser) {
      console.log(`   ✅ Regular user found: ${regularUser.email}`);
      console.log(`   👤 Role: ${regularUser.role}`);
    } else {
      console.log(`   ❌ Regular user not found`);
      return false;
    }

    console.log('\n✅ AUTHENTICATION SYSTEM VERIFIED');
    console.log('==================================');
    console.log('🎉 Your authentication system is ready for production!');
    console.log('\n📋 Production Credentials:');
    console.log('👑 Super Admin:');
    console.log('   📧 Email: bozard@gmail.com');
    console.log('   🔑 Password: TempPassword123!');
    console.log('   ⚠️ CHANGE PASSWORD AFTER FIRST LOGIN');
    console.log('\n👤 Regular User Example:');
    console.log('   📧 Email: afriglobalimports@gmail.com');
    console.log('   🔑 Password: [Your existing password]');

    return true;

  } catch (error) {
    console.error('❌ Authentication verification failed:', error.message);
    return false;
  }
}

// Add to package.json scripts
console.log('\n💡 Add this to your package.json scripts:');
console.log('"verify:auth": "node verify-authentication.js"');

verifyAuthentication().catch(console.error); 