const { createClient } = require('@supabase/supabase-js');

async function checkVerificationData() {
  console.log('🔍 Checking Verification Page Data...\n');

  try {
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Check all payments in the database
    console.log('1️⃣ All payments in database:');
    const { data: allPayments, error: allError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.log('❌ Error fetching all payments:', allError);
      return;
    }

    console.log(`✅ Total payments: ${allPayments.length}`);
    allPayments.forEach(payment => {
      console.log(`📋 Payment ${payment.id}:`);
      console.log(`   User ID: ${payment.user_id || 'NULL'}`);
      console.log(`   Merchant ID: ${payment.merchant_id || 'NULL'}`);
      console.log(`   Customer: ${payment.customer_name || 'N/A'}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Proof URL: ${payment.payment_proof_url ? 'YES' : 'NO'}`);
      console.log('');
    });

    // Check the merchant ID we're using
    const merchantId = '00000000-0000-0000-0000-000000000001';
    console.log(`2️⃣ Payments TO merchant ${merchantId}:`);
    
    const { data: merchantPayments, error: merchantError } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (merchantError) {
      console.log('❌ Error fetching merchant payments:', merchantError);
      return;
    }

    console.log(`✅ Merchant payments: ${merchantPayments.length}`);
    merchantPayments.forEach(payment => {
      console.log(`📋 Payment ${payment.id}:`);
      console.log(`   Customer: ${payment.customer_name} (${payment.customer_email})`);
      console.log(`   Amount: $${payment.amount} ${payment.currency}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Method: ${payment.payment_method}`);
      console.log(`   Country: ${payment.country}`);
      console.log(`   Proof URL: ${payment.payment_proof_url || 'N/A'}`);
      console.log(`   Created: ${payment.created_at}`);
      console.log('');
    });

    // Check payments BY the merchant (user_id = merchant_id)
    console.log(`3️⃣ Payments BY user ${merchantId}:`);
    
    const { data: userPayments, error: userError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', merchantId)
      .order('created_at', { ascending: false });

    if (userError) {
      console.log('❌ Error fetching user payments:', userError);
      return;
    }

    console.log(`✅ User payments: ${userPayments.length}`);
    if (userPayments.length === 0) {
      console.log('   No payments found where user_id = merchant_id');
      console.log('   This explains why verification page shows empty!');
    }

  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

checkVerificationData(); 