const { createClient } = require('@supabase/supabase-js');

async function checkRecentPayments() {
  console.log('💰 Checking Recent Payments...\n');

  try {
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.log('❌ Error fetching payments:', error);
      return;
    }

    console.log('✅ Recent payments found:', payments.length);
    payments.forEach(payment => {
      console.log(`📋 Payment: ${payment.id}`);
      console.log(`   Customer: ${payment.customer_name} (${payment.customer_email})`);
      console.log(`   Amount: $${payment.amount} ${payment.currency}`);
      console.log(`   Method: ${payment.payment_method}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Country: ${payment.country}`);
      console.log(`   Proof URL: ${payment.payment_proof_url}`);
      console.log(`   Created: ${payment.created_at}`);
      console.log('');
    });

  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

checkRecentPayments(); 