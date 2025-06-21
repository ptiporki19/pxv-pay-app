const { createClient } = require('@supabase/supabase-js');

async function checkPaymentMethodsRLS() {
  console.log('🔒 Checking Payment Methods RLS Policies...\n');

  try {
    // Test with anon client (like the API uses)
    console.log('1️⃣ Testing with anon client...');
    const anonClient = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );

    const { data: anonMethods, error: anonError } = await anonClient
      .from('payment_methods')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .eq('status', 'active')
      .contains('countries', ['US']);
    
    if (anonError) {
      console.log('❌ Anon client error:', anonError);
    } else {
      console.log('✅ Anon client success:', anonMethods.length, 'methods found');
    }

    // Test with service role client
    console.log('\n2️⃣ Testing with service role client...');
    const serviceClient = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    const { data: serviceMethods, error: serviceError } = await serviceClient
      .from('payment_methods')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .eq('status', 'active')
      .contains('countries', ['US']);
    
    if (serviceError) {
      console.log('❌ Service client error:', serviceError);
    } else {
      console.log('✅ Service client success:', serviceMethods.length, 'methods found');
    }

    // Test the exact query from the API
    console.log('\n3️⃣ Testing exact API query...');
    const { data: apiMethods, error: apiError } = await anonClient
      .from('payment_methods')
      .select(`
        id,
        name,
        type,
        description,
        instructions_for_checkout,
        icon,
        url,
        country_specific_details,
        display_order,
        countries
      `)
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .eq('status', 'active')
      .contains('countries', ['US'])
      .order('display_order');
    
    if (apiError) {
      console.log('❌ API query error:', apiError);
    } else {
      console.log('✅ API query success:', apiMethods.length, 'methods found');
      if (apiMethods.length > 0) {
        console.log('📋 First method:', apiMethods[0].name);
      }
    }

  } catch (error) {
    console.error('💥 RLS check failed:', error.message);
  }
}

checkPaymentMethodsRLS(); 