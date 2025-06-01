const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCheckoutLinks() {
  const { data, error } = await supabase
    .from('checkout_links')
    .select('slug, link_name, active_country_codes, is_active, merchant_id')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Active checkout links:');
  data?.forEach(link => {
    console.log(`- ${link.link_name || 'Untitled'} (${link.slug})`);
    console.log(`  Countries: ${link.active_country_codes?.join(', ')}`);
    console.log(`  Merchant ID: ${link.merchant_id}`);
    console.log('');
  });
}

checkCheckoutLinks(); 