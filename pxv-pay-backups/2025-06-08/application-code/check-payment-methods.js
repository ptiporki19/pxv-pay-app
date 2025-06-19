const { createClient } = require('@supabase/supabase-js');

async function checkPaymentMethods() {
  console.log('🔍 Checking Payment Methods Table...\n');

  try {
    // Create service role client
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // First, let's see all columns in the payment_methods table
    console.log('1️⃣ Getting all payment methods...');
    const { data: allMethods, error: allError } = await supabase
      .from('payment_methods')
      .select('*')
      .limit(5);
    
    if (allError) {
      console.log('❌ Error fetching payment methods:', allError);
      return;
    }
    
    console.log('📊 Payment methods found:', allMethods.length);
    if (allMethods.length > 0) {
      console.log('📋 First payment method:');
      console.log(JSON.stringify(allMethods[0], null, 2));
    }

    // Check if user_id column exists and what values it has
    console.log('\n2️⃣ Checking user_id values...');
    const uniqueUserIds = [...new Set(allMethods.map(m => m.user_id))];
    console.log('🆔 Unique user_id values:', uniqueUserIds);

    // Get the merchant_id from checkout link for comparison
    console.log('\n3️⃣ Getting merchant ID from checkout link...');
    const { data: checkoutLink, error: linkError } = await supabase
      .from('checkout_links')
      .select('merchant_id')
      .eq('slug', 'simple-payment')
      .single();
    
    if (linkError) {
      console.log('❌ Error fetching checkout link:', linkError);
      return;
    }
    
    console.log('🏪 Merchant ID from checkout link:', checkoutLink.merchant_id);

    // Check if any payment methods match the merchant_id
    console.log('\n4️⃣ Checking for methods matching merchant ID...');
    const { data: matchingMethods, error: matchError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', checkoutLink.merchant_id);
    
    if (matchError) {
      console.log('❌ Error finding matching methods:', matchError);
    } else {
      console.log('🎯 Methods matching merchant ID:', matchingMethods.length);
    }

    // Check for US country support
    console.log('\n5️⃣ Checking US country support...');
    const { data: usMethods, error: usError } = await supabase
      .from('payment_methods')
      .select('*')
      .contains('countries', ['US']);
    
    if (usError) {
      console.log('❌ Error finding US methods:', usError);
    } else {
      console.log('🇺🇸 Methods supporting US:', usMethods.length);
      if (usMethods.length > 0) {
        usMethods.forEach(method => {
          console.log(`   - ${method.name} (user_id: ${method.user_id})`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

checkPaymentMethods(); 