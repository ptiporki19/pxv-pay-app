const { createClient } = require('@supabase/supabase-js');

async function checkMerchants() {
  console.log('🏪 Checking Merchants Table...\n');

  try {
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );

    // Check if merchants table exists and has data
    console.log('1️⃣ Checking merchants table...');
    const { data: merchants, error: merchantsError } = await supabase
      .from('merchants')
      .select('*')
      .limit(5);

    if (merchantsError) {
      console.log('❌ Merchants table error:', merchantsError);
      return;
    }

    console.log('✅ Merchants found:', merchants.length);
    if (merchants.length > 0) {
      console.log('📋 First merchant:', merchants[0]);
    }

    // Check if the specific merchant ID exists
    const merchantId = '00000000-0000-0000-0000-000000000001';
    console.log('\n2️⃣ Checking for specific merchant ID:', merchantId);
    
    const { data: specificMerchant, error: specificError } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single();

    if (specificError && specificError.code === 'PGRST116') {
      console.log('❌ Merchant not found, creating...');
      
      // Create the missing merchant
      const { data: newMerchant, error: createError } = await supabase
        .from('merchants')
        .insert({
          id: merchantId,
          name: 'Test Merchant',
          description: 'Test merchant for PXV Pay development',
          website: 'https://testmerchant.com',
          status: 'active',
          owner_id: merchantId, // Use the same ID as owner for simplicity
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.log('❌ Error creating merchant:', createError);
      } else {
        console.log('✅ Merchant created successfully:', newMerchant.id);
      }
    } else if (specificError) {
      console.log('❌ Error checking merchant:', specificError);
    } else {
      console.log('✅ Merchant already exists:', specificMerchant.id);
    }

  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

checkMerchants(); 