require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Get service role key from CLI output
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabaseKey = SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Error: Supabase URL not found in environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);
console.log(`Using Supabase URL: ${supabaseUrl}`);

async function testSimpleInsert() {
  try {
    console.log('Testing payment method creation with minimal fields...');
    
    // Simple test payment method (avoiding 'countries' field)
    const testPaymentMethod = {
      name: 'Test Payment Method',
      type: 'bank',
      status: 'active'
    };
    
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([testPaymentMethod])
      .select();
    
    if (error) {
      console.error('Error creating payment method:', error);
    } else {
      console.log('Successfully created payment method:', data);
      
      // Clean up
      if (data && data[0] && data[0].id) {
        const { error: deleteError } = await supabase
          .from('payment_methods')
          .delete()
          .eq('id', data[0].id);
        
        if (deleteError) {
          console.error('Error deleting test payment method:', deleteError);
        } else {
          console.log('Test payment method deleted successfully');
        }
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSimpleInsert(); 