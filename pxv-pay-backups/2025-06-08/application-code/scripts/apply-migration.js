const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  console.log('Applying database migration for payment methods...')
  
  try {
    // Add instructions column
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS instructions TEXT;'
    })
    
    if (error1) {
      console.log('Instructions column may already exist:', error1.message)
    } else {
      console.log('✅ Added instructions column')
    }
    
    // Add url column
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS url TEXT;'
    })
    
    if (error2) {
      console.log('URL column may already exist:', error2.message)
    } else {
      console.log('✅ Added url column')
    }
    
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Error applying migration:', error)
  }
}

// Test CRUD operations
async function testCRUD() {
  console.log('\nTesting CRUD operations...')
  
  try {
    // Test reading data
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .limit(5)
    
    if (countriesError) {
      console.error('Error reading countries:', countriesError)
    } else {
      console.log('✅ Countries read successfully:', countries?.length || 0, 'items')
    }
    
    const { data: currencies, error: currenciesError } = await supabase
      .from('currencies')
      .select('*')
      .limit(5)
    
    if (currenciesError) {
      console.error('Error reading currencies:', currenciesError)
    } else {
      console.log('✅ Currencies read successfully:', currencies?.length || 0, 'items')
    }
    
    const { data: paymentMethods, error: paymentMethodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .limit(5)
    
    if (paymentMethodsError) {
      console.error('Error reading payment methods:', paymentMethodsError)
    } else {
      console.log('✅ Payment methods read successfully:', paymentMethods?.length || 0, 'items')
    }
    
  } catch (error) {
    console.error('Error testing CRUD operations:', error)
  }
}

// Run the migration and tests
applyMigration().then(() => testCRUD())