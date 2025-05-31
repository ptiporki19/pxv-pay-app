const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Global currencies data - Expanded to include more worldwide currencies
const globalCurrencies = [
  // Major World Currencies
  { name: 'US Dollar', code: 'USD', symbol: '$' },
  { name: 'Euro', code: 'EUR', symbol: '€' },
  { name: 'British Pound', code: 'GBP', symbol: '£' },
  { name: 'Japanese Yen', code: 'JPY', symbol: '¥' },
  { name: 'Canadian Dollar', code: 'CAD', symbol: 'C$' },
  { name: 'Australian Dollar', code: 'AUD', symbol: 'A$' },
  { name: 'Swiss Franc', code: 'CHF', symbol: 'CHF' },
  { name: 'Chinese Yuan', code: 'CNY', symbol: '¥' },
  { name: 'Indian Rupee', code: 'INR', symbol: '₹' },
  
  // African Currencies
  { name: 'South African Rand', code: 'ZAR', symbol: 'R' },
  { name: 'Nigerian Naira', code: 'NGN', symbol: '₦' },
  { name: 'Kenyan Shilling', code: 'KES', symbol: 'KSh' },
  { name: 'Ghanaian Cedi', code: 'GHS', symbol: '₵' },
  { name: 'Egyptian Pound', code: 'EGP', symbol: '£' },
  { name: 'Moroccan Dirham', code: 'MAD', symbol: 'DH' },
  { name: 'Tunisian Dinar', code: 'TND', symbol: 'د.ت' },
  { name: 'Algerian Dinar', code: 'DZD', symbol: 'دج' },
  { name: 'Ethiopian Birr', code: 'ETB', symbol: 'Br' },
  { name: 'Ugandan Shilling', code: 'UGX', symbol: 'USh' },
  { name: 'Tanzanian Shilling', code: 'TZS', symbol: 'TSh' },
  { name: 'Zambian Kwacha', code: 'ZMW', symbol: 'ZK' },
  { name: 'Botswana Pula', code: 'BWP', symbol: 'P' },
  { name: 'Namibian Dollar', code: 'NAD', symbol: 'N$' },
  { name: 'Rwandan Franc', code: 'RWF', symbol: 'FRw' },
  { name: 'CFA Franc BCEAO', code: 'XOF', symbol: 'CFA' },
  { name: 'CFA Franc BEAC', code: 'XAF', symbol: 'FCFA' },
  
  // South American Currencies
  { name: 'Brazilian Real', code: 'BRL', symbol: 'R$' },
  { name: 'Mexican Peso', code: 'MXN', symbol: '$' },
  { name: 'Argentine Peso', code: 'ARS', symbol: '$' },
  { name: 'Chilean Peso', code: 'CLP', symbol: '$' },
  { name: 'Colombian Peso', code: 'COP', symbol: '$' },
  { name: 'Peruvian Sol', code: 'PEN', symbol: 'S/' },
  { name: 'Uruguayan Peso', code: 'UYU', symbol: '$' },
  { name: 'Venezuelan Bolívar', code: 'VES', symbol: 'Bs' },
  
  // Asian Currencies
  { name: 'South Korean Won', code: 'KRW', symbol: '₩' },
  { name: 'Singapore Dollar', code: 'SGD', symbol: 'S$' },
  { name: 'Hong Kong Dollar', code: 'HKD', symbol: 'HK$' },
  { name: 'Thai Baht', code: 'THB', symbol: '฿' },
  { name: 'Malaysian Ringgit', code: 'MYR', symbol: 'RM' },
  { name: 'Indonesian Rupiah', code: 'IDR', symbol: 'Rp' },
  { name: 'Philippine Peso', code: 'PHP', symbol: '₱' },
  { name: 'Vietnamese Dong', code: 'VND', symbol: '₫' },
  { name: 'Pakistani Rupee', code: 'PKR', symbol: '₨' },
  { name: 'Bangladeshi Taka', code: 'BDT', symbol: '৳' },
  { name: 'Sri Lankan Rupee', code: 'LKR', symbol: '₨' },
  { name: 'Nepalese Rupee', code: 'NPR', symbol: '₨' },
  
  // Middle Eastern Currencies
  { name: 'Saudi Riyal', code: 'SAR', symbol: '﷼' },
  { name: 'UAE Dirham', code: 'AED', symbol: 'د.إ' },
  { name: 'Israeli Shekel', code: 'ILS', symbol: '₪' },
  { name: 'Turkish Lira', code: 'TRY', symbol: '₺' },
  { name: 'Iranian Rial', code: 'IRR', symbol: '﷼' },
  { name: 'Qatari Riyal', code: 'QAR', symbol: '﷼' },
  { name: 'Kuwaiti Dinar', code: 'KWD', symbol: 'د.ك' },
  { name: 'Bahraini Dinar', code: 'BHD', symbol: '.د.ب' },
  { name: 'Omani Rial', code: 'OMR', symbol: '﷼' },
  { name: 'Jordanian Dinar', code: 'JOD', symbol: 'د.ا' },
  { name: 'Lebanese Pound', code: 'LBP', symbol: '£' },
  
  // European Currencies
  { name: 'Russian Ruble', code: 'RUB', symbol: '₽' },
  { name: 'Ukrainian Hryvnia', code: 'UAH', symbol: '₴' },
  { name: 'New Zealand Dollar', code: 'NZD', symbol: 'NZ$' },
  { name: 'Norwegian Krone', code: 'NOK', symbol: 'kr' },
  { name: 'Swedish Krona', code: 'SEK', symbol: 'kr' },
  { name: 'Danish Krone', code: 'DKK', symbol: 'kr' },
  { name: 'Polish Zloty', code: 'PLN', symbol: 'zł' },
  { name: 'Czech Koruna', code: 'CZK', symbol: 'Kč' },
  { name: 'Hungarian Forint', code: 'HUF', symbol: 'Ft' },
  { name: 'Romanian Leu', code: 'RON', symbol: 'lei' },
  { name: 'Bulgarian Lev', code: 'BGN', symbol: 'лв' },
  { name: 'Croatian Kuna', code: 'HRK', symbol: 'kn' },
  { name: 'Serbian Dinar', code: 'RSD', symbol: 'дин' },
  { name: 'Icelandic Krona', code: 'ISK', symbol: 'kr' }
];

// Global countries with their currency mappings - Comprehensive worldwide coverage
const globalCountries = [
  // North America
  { name: 'United States', code: 'US', currency: 'USD' },
  { name: 'Canada', code: 'CA', currency: 'CAD' },
  { name: 'Mexico', code: 'MX', currency: 'MXN' },
  
  // Europe
  { name: 'United Kingdom', code: 'GB', currency: 'GBP' },
  { name: 'Germany', code: 'DE', currency: 'EUR' },
  { name: 'France', code: 'FR', currency: 'EUR' },
  { name: 'Italy', code: 'IT', currency: 'EUR' },
  { name: 'Spain', code: 'ES', currency: 'EUR' },
  { name: 'Netherlands', code: 'NL', currency: 'EUR' },
  { name: 'Belgium', code: 'BE', currency: 'EUR' },
  { name: 'Austria', code: 'AT', currency: 'EUR' },
  { name: 'Portugal', code: 'PT', currency: 'EUR' },
  { name: 'Switzerland', code: 'CH', currency: 'CHF' },
  { name: 'Norway', code: 'NO', currency: 'NOK' },
  { name: 'Sweden', code: 'SE', currency: 'SEK' },
  { name: 'Denmark', code: 'DK', currency: 'DKK' },
  { name: 'Finland', code: 'FI', currency: 'EUR' },
  { name: 'Ireland', code: 'IE', currency: 'EUR' },
  { name: 'Poland', code: 'PL', currency: 'PLN' },
  { name: 'Czech Republic', code: 'CZ', currency: 'CZK' },
  { name: 'Hungary', code: 'HU', currency: 'HUF' },
  { name: 'Romania', code: 'RO', currency: 'RON' },
  { name: 'Bulgaria', code: 'BG', currency: 'BGN' },
  { name: 'Croatia', code: 'HR', currency: 'HRK' },
  { name: 'Serbia', code: 'RS', currency: 'RSD' },
  { name: 'Ukraine', code: 'UA', currency: 'UAH' },
  { name: 'Russia', code: 'RU', currency: 'RUB' },
  { name: 'Iceland', code: 'IS', currency: 'ISK' },
  
  // Asia
  { name: 'China', code: 'CN', currency: 'CNY' },
  { name: 'India', code: 'IN', currency: 'INR' },
  { name: 'Japan', code: 'JP', currency: 'JPY' },
  { name: 'South Korea', code: 'KR', currency: 'KRW' },
  { name: 'Indonesia', code: 'ID', currency: 'IDR' },
  { name: 'Thailand', code: 'TH', currency: 'THB' },
  { name: 'Vietnam', code: 'VN', currency: 'VND' },
  { name: 'Philippines', code: 'PH', currency: 'PHP' },
  { name: 'Malaysia', code: 'MY', currency: 'MYR' },
  { name: 'Singapore', code: 'SG', currency: 'SGD' },
  { name: 'Hong Kong', code: 'HK', currency: 'HKD' },
  { name: 'Taiwan', code: 'TW', currency: 'USD' }, // Uses USD
  { name: 'Pakistan', code: 'PK', currency: 'PKR' },
  { name: 'Bangladesh', code: 'BD', currency: 'BDT' },
  { name: 'Sri Lanka', code: 'LK', currency: 'LKR' },
  { name: 'Nepal', code: 'NP', currency: 'NPR' },
  { name: 'Myanmar', code: 'MM', currency: 'USD' }, // Often uses USD
  { name: 'Cambodia', code: 'KH', currency: 'USD' }, // Often uses USD
  { name: 'Laos', code: 'LA', currency: 'USD' }, // Often uses USD
  
  // Middle East
  { name: 'Saudi Arabia', code: 'SA', currency: 'SAR' },
  { name: 'United Arab Emirates', code: 'AE', currency: 'AED' },
  { name: 'Qatar', code: 'QA', currency: 'QAR' },
  { name: 'Kuwait', code: 'KW', currency: 'KWD' },
  { name: 'Bahrain', code: 'BH', currency: 'BHD' },
  { name: 'Oman', code: 'OM', currency: 'OMR' },
  { name: 'Jordan', code: 'JO', currency: 'JOD' },
  { name: 'Lebanon', code: 'LB', currency: 'LBP' },
  { name: 'Israel', code: 'IL', currency: 'ILS' },
  { name: 'Turkey', code: 'TR', currency: 'TRY' },
  { name: 'Iran', code: 'IR', currency: 'IRR' },
  { name: 'Iraq', code: 'IQ', currency: 'USD' }, // Often uses USD
  
  // Africa - Comprehensive Coverage
  { name: 'Nigeria', code: 'NG', currency: 'NGN' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR' },
  { name: 'Egypt', code: 'EG', currency: 'EGP' },
  { name: 'Kenya', code: 'KE', currency: 'KES' },
  { name: 'Ghana', code: 'GH', currency: 'GHS' },
  { name: 'Morocco', code: 'MA', currency: 'MAD' },
  { name: 'Algeria', code: 'DZ', currency: 'DZD' },
  { name: 'Tunisia', code: 'TN', currency: 'TND' },
  { name: 'Ethiopia', code: 'ET', currency: 'ETB' },
  { name: 'Uganda', code: 'UG', currency: 'UGX' },
  { name: 'Tanzania', code: 'TZ', currency: 'TZS' },
  { name: 'Angola', code: 'AO', currency: 'USD' }, // Often uses USD
  { name: 'Mozambique', code: 'MZ', currency: 'USD' }, // Often uses USD
  { name: 'Zambia', code: 'ZM', currency: 'ZMW' },
  { name: 'Zimbabwe', code: 'ZW', currency: 'USD' }, // Uses USD
  { name: 'Botswana', code: 'BW', currency: 'BWP' },
  { name: 'Namibia', code: 'NA', currency: 'NAD' },
  { name: 'Rwanda', code: 'RW', currency: 'RWF' },
  { name: 'Senegal', code: 'SN', currency: 'XOF' },
  { name: 'Ivory Coast', code: 'CI', currency: 'XOF' },
  { name: 'Mali', code: 'ML', currency: 'XOF' },
  { name: 'Burkina Faso', code: 'BF', currency: 'XOF' },
  { name: 'Cameroon', code: 'CM', currency: 'XAF' },
  { name: 'Chad', code: 'TD', currency: 'XAF' },
  { name: 'Democratic Republic of Congo', code: 'CD', currency: 'USD' }, // Often uses USD
  { name: 'Republic of Congo', code: 'CG', currency: 'XAF' },
  { name: 'Gabon', code: 'GA', currency: 'XAF' },
  { name: 'Equatorial Guinea', code: 'GQ', currency: 'XAF' },
  { name: 'Central African Republic', code: 'CF', currency: 'XAF' },
  { name: 'Sudan', code: 'SD', currency: 'USD' }, // Often uses USD
  { name: 'South Sudan', code: 'SS', currency: 'USD' }, // Uses USD
  { name: 'Libya', code: 'LY', currency: 'USD' }, // Often uses USD
  { name: 'Mauritius', code: 'MU', currency: 'USD' }, // Often accepts USD
  { name: 'Seychelles', code: 'SC', currency: 'USD' }, // Often accepts USD
  { name: 'Madagascar', code: 'MG', currency: 'USD' }, // Often uses USD
  { name: 'Malawi', code: 'MW', currency: 'USD' }, // Often uses USD
  
  // South America
  { name: 'Brazil', code: 'BR', currency: 'BRL' },
  { name: 'Argentina', code: 'AR', currency: 'ARS' },
  { name: 'Chile', code: 'CL', currency: 'CLP' },
  { name: 'Colombia', code: 'CO', currency: 'COP' },
  { name: 'Peru', code: 'PE', currency: 'PEN' },
  { name: 'Venezuela', code: 'VE', currency: 'VES' },
  { name: 'Ecuador', code: 'EC', currency: 'USD' }, // Uses USD
  { name: 'Uruguay', code: 'UY', currency: 'UYU' },
  { name: 'Paraguay', code: 'PY', currency: 'USD' }, // Often uses USD
  { name: 'Bolivia', code: 'BO', currency: 'USD' }, // Often uses USD
  { name: 'Guyana', code: 'GY', currency: 'USD' }, // Often uses USD
  { name: 'Suriname', code: 'SR', currency: 'USD' }, // Often uses USD
  
  // Central America & Caribbean
  { name: 'Guatemala', code: 'GT', currency: 'USD' }, // Often uses USD
  { name: 'Costa Rica', code: 'CR', currency: 'USD' }, // Often accepts USD
  { name: 'Panama', code: 'PA', currency: 'USD' }, // Uses USD
  { name: 'Jamaica', code: 'JM', currency: 'USD' }, // Often uses USD
  { name: 'Dominican Republic', code: 'DO', currency: 'USD' }, // Often uses USD
  { name: 'Haiti', code: 'HT', currency: 'USD' }, // Often uses USD
  { name: 'Trinidad and Tobago', code: 'TT', currency: 'USD' }, // Often uses USD
  { name: 'Barbados', code: 'BB', currency: 'USD' }, // Often uses USD
  
  // Oceania
  { name: 'Australia', code: 'AU', currency: 'AUD' },
  { name: 'New Zealand', code: 'NZ', currency: 'NZD' },
  { name: 'Fiji', code: 'FJ', currency: 'USD' }, // Often accepts USD
  { name: 'Papua New Guinea', code: 'PG', currency: 'USD' }, // Often uses USD
];

async function seedGlobalData() {
  console.log('🌍 Starting global countries and currencies seeding...');
  console.log('='.repeat(60));
  
  try {
    // 1. Clear existing global data first
    console.log('🧹 Clearing existing global data...');
    
    const { error: clearCountriesError } = await supabase
      .from('countries')
      .delete()
      .is('user_id', null);
    
    const { error: clearCurrenciesError } = await supabase
      .from('currencies')
      .delete()
      .is('user_id', null);
    
    if (clearCountriesError || clearCurrenciesError) {
      console.warn('⚠️  Warning clearing existing data (may be first run)');
    }
    
    // 2. Insert global currencies
    console.log('💰 Inserting global currencies...');
    
    const currenciesToInsert = globalCurrencies.map(currency => ({
      user_id: null, // Global data
      name: currency.name,
      code: currency.code,
      symbol: currency.symbol,
      status: 'active'
    }));
    
    const { data: insertedCurrencies, error: currencyError } = await supabase
      .from('currencies')
      .insert(currenciesToInsert)
      .select('id, code');
    
    if (currencyError) {
      console.error('❌ Error inserting currencies:', currencyError);
      return;
    }
    
    console.log(`✅ Successfully inserted ${insertedCurrencies?.length || globalCurrencies.length} currencies`);
    
    // Create currency map for quick lookup
    const currencyMap = {};
    insertedCurrencies.forEach(currency => {
      currencyMap[currency.code] = currency.id;
    });
    
    console.log(`📊 Currency mapping created for ${Object.keys(currencyMap).length} currencies`);
    
    // 3. Insert global countries with currency relationships
    console.log('\n🗺️  Inserting global countries...');
    
    const countriesToInsert = globalCountries.map(country => {
      const currencyId = currencyMap[country.currency];
      if (!currencyId) {
        console.warn(`⚠️  Currency ${country.currency} not found for country ${country.name}`);
      }
      return {
        user_id: null, // Global data
        name: country.name,
        code: country.code,
        currency_id: currencyId,
        status: 'active'
      };
    }).filter(country => country.currency_id); // Only include countries with valid currency
    
    const { data: insertedCountries, error: countryError } = await supabase
      .from('countries')
      .insert(countriesToInsert)
      .select('id, code, name');
    
    if (countryError) {
      console.error('❌ Error inserting countries:', countryError);
      return;
    }
    
    console.log(`✅ Successfully inserted ${insertedCountries?.length || countriesToInsert.length} countries`);
    
    // 4. Verification
    console.log('\n🔍 Verifying global data...');
    
    const { data: verifyCountries } = await supabase
      .from('countries')
      .select('id, name, code, currency_id')
      .is('user_id', null);
    
    const { data: verifyCurrencies } = await supabase
      .from('currencies')
      .select('id, name, code, symbol')
      .is('user_id', null);
    
    console.log(`📈 Final counts:`);
    console.log(`   • Global currencies: ${verifyCurrencies?.length || 0}`);
    console.log(`   • Global countries: ${verifyCountries?.length || 0}`);
    
    // Show some examples
    if (verifyCountries && verifyCountries.length > 0) {
      console.log('\n📋 Sample countries added:');
      verifyCountries.slice(0, 5).forEach(country => {
        const currency = insertedCurrencies.find(c => c.id === country.currency_id);
        console.log(`   • ${country.name} (${country.code}) → ${currency?.code || 'N/A'}`);
      });
    }
    
    console.log('\n🎉 Global data seeding completed successfully!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('💥 Unexpected error during seeding:', error);
  }
}

async function main() {
  console.log('🚀 PXV Pay - Global Countries & Currencies Seeder');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  await seedGlobalData();
  
  console.log('\n✨ Script execution completed.');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedGlobalData }; 