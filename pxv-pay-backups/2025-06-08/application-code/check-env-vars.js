// Check environment variables available to the API
console.log('🔍 Checking Environment Variables...\n');

console.log('📊 Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Test if we can create a service client
try {
  const { createClient } = require('@supabase/supabase-js');
  
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
  );
  
  console.log('\n✅ Service client created successfully');
  console.log('🔗 Using URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321');
  
} catch (error) {
  console.log('\n❌ Error creating service client:', error.message);
} 