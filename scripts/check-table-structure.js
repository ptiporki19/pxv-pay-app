require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
  try {
    // Test insert with minimal data to see what fields are required
    const testData = {
      name: 'Test Manual Payment',
      type: 'bank',
      status: 'inactive'
    };

    console.log('Attempting to insert with minimal data:', testData);
    
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('Insert error:', error);
    } else {
      console.log('Insert successful:', data);
      
      // Clean up the test data
      if (data && data[0] && data[0].id) {
        const { error: deleteError } = await supabase
          .from('payment_methods')
          .delete()
          .eq('id', data[0].id);
        
        if (deleteError) {
          console.error('Cleanup error:', deleteError);
        } else {
          console.log('Test data cleaned up successfully');
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStructure(); 