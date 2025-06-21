const { createClient } = require('@supabase/supabase-js');

async function debugPaymentIssue() {
  console.log('🔍 Debugging Payment Submission Issue...\n');

  try {
    // Create service role client
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Check checkout link exists
    console.log('1️⃣ Checking checkout link...');
    const { data: checkoutLink, error: linkError } = await supabase
      .from('checkout_links')
      .select('*')
      .eq('slug', 'simple-payment')
      .single();
    
    if (linkError) {
      console.log('❌ Checkout link error:', linkError);
      return;
    }
    console.log('✅ Checkout link found:', checkoutLink.id);

    // Check payment methods for US
    console.log('\n2️⃣ Checking payment methods for US...');
    const { data: paymentMethods, error: methodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .contains('countries', ['US'])
      .eq('status', 'active');
    
    if (methodsError) {
      console.log('❌ Payment methods error:', methodsError);
      return;
    }
    console.log('✅ Payment methods found:', paymentMethods.length);
    if (paymentMethods.length > 0) {
      console.log('   First method:', paymentMethods[0].id, '-', paymentMethods[0].name);
    }

    // Check countries
    console.log('\n3️⃣ Checking countries...');
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*, currency:currencies(*)')
      .eq('code', 'US')
      .single();
    
    if (countriesError) {
      console.log('❌ Countries error:', countriesError);
      return;
    }
    console.log('✅ Country found:', countries.name, 'Currency:', countries.currency?.code);

    // Test direct payment insertion
    console.log('\n4️⃣ Testing direct payment insertion...');
    const testPayment = {
      id: 'test-payment-' + Date.now(),
      merchant_id: checkoutLink.merchant_id,
      checkout_link_id: checkoutLink.id,
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      amount: 50.00,
      currency: countries.currency?.code || 'USD',
      country: 'US',
      payment_method: paymentMethods[0]?.name || 'Test Method',
      payment_proof_url: 'https://example.com/proof.jpg',
      status: 'pending_verification'
    };

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(testPayment)
      .select()
      .single();
    
    if (paymentError) {
      console.log('❌ Payment insertion error:', paymentError);
      return;
    }
    console.log('✅ Payment inserted successfully:', payment.id);

    // Clean up test payment
    await supabase.from('payments').delete().eq('id', payment.id);
    console.log('✅ Test payment cleaned up');

  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  }
}

debugPaymentIssue(); 