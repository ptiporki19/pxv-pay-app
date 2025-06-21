const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking database schema...')
  
  try {
    // Check if tables exist
    const tables = ['countries', 'currencies', 'payment_methods']
    
    for (const table of tables) {
      console.log(`\n📋 Table: ${table}`)
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ Error accessing ${table}:`, error.message)
      } else {
        console.log(`✅ ${table} table exists`)
        if (data && data.length > 0) {
          console.log('   Sample columns:', Object.keys(data[0]).join(', '))
        } else {
          console.log('   Table is empty')
        }
      }
    }
    
    // Try adding a simple payment method to see what works
    console.log('\n🧪 Testing payment method insertion...')
    
    const simpleMethod = {
      name: 'Test Method',
      type: 'bank',
      status: 'active'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('payment_methods')
      .insert([simpleMethod])
      .select()
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message)
    } else {
      console.log('✅ Simple insert successful:', insertData)
      
      // Clean up the test record
      if (insertData && insertData[0]) {
        await supabase
          .from('payment_methods')
          .delete()
          .eq('id', insertData[0].id)
        console.log('🧹 Cleaned up test record')
      }
    }
    
  } catch (error) {
    console.error('Error checking schema:', error)
  }
}

checkSchema() 