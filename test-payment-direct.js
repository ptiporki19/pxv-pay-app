const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

async function testPaymentDirect() {
  console.log('🧪 Testing Direct Payment Insertion...\n');

  try {
    // Create service role client (same as API uses)
    const serviceSupabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Get checkout link data
    console.log('1️⃣ Getting checkout link...');
    const { data: checkoutLink, error: linkError } = await serviceSupabase
      .from('checkout_links')
      .select('*, merchant_id')
      .eq('slug', 'simple-payment')
      .eq('is_active', true)
      .single();

    if (linkError) {
      console.log('❌ Checkout link error:', linkError);
      return;
    }
    console.log('✅ Checkout link found:', checkoutLink.id);

    // Get country data
    console.log('2️⃣ Getting country data...');
    const { data: countryData, error: countryError } = await serviceSupabase
      .from('countries')
      .select('*, currency:currencies(*)')
      .eq('code', 'US')
      .single();

    if (countryError) {
      console.log('❌ Country error:', countryError);
      return;
    }
    console.log('✅ Country found:', countryData.name, 'Currency:', countryData.currency?.code);

    // Get payment method
    console.log('3️⃣ Getting payment method...');
    const { data: paymentMethod, error: methodError } = await serviceSupabase
      .from('payment_methods')
      .select('*')
      .eq('id', '80690fa1-09e4-4f6b-9fb9-d93bfe5c3772')
      .eq('status', 'active')
      .single();

    if (methodError) {
      console.log('❌ Payment method error:', methodError);
      return;
    }
    console.log('✅ Payment method found:', paymentMethod.name);

    // Create payment record (same as API does)
    console.log('4️⃣ Creating payment record...');
    const paymentId = randomUUID();
    const paymentData = {
      id: paymentId,
      merchant_id: checkoutLink.merchant_id,
      checkout_link_id: checkoutLink.id,
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      amount: 50.00,
      currency: countryData.currency.code,
      country: 'US',
      payment_method: paymentMethod.name,
      payment_proof_url: 'https://example.com/test-proof.jpg',
      status: 'pending_verification',
      created_at: new Date().toISOString()
    };

    console.log('📋 Payment data:', paymentData);

    const { data: payment, error: paymentError } = await serviceSupabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.log('❌ Payment insertion error:', paymentError);
      return;
    }

    console.log('✅ Payment created successfully!');
    console.log('💾 Payment ID:', payment.id);
    console.log('📊 Payment details:', {
      customer: payment.customer_name,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.payment_method
    });

    // Clean up
    await serviceSupabase.from('payments').delete().eq('id', payment.id);
    console.log('🧹 Test payment cleaned up');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testPaymentDirect(); 