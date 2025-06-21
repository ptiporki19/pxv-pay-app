const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectPaymentMethods() {
  console.log('Inspecting payment_methods table...')
  
  try {
    // Check all tables to see what's available
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('Cannot query information_schema, trying direct approach...')
    } else {
      console.log('📋 Available tables:', tablesData?.map(t => t.table_name).join(', '))
    }
    
    // Try to get the structure by describing the table
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'payment_methods')
      .eq('table_schema', 'public')
    
    if (error) {
      console.log('Cannot query column information, error:', error.message)
      
      // Try a different approach - insert with minimal data to see what fails
      console.log('\n🔍 Trying minimal insert to understand structure...')
      
      const testMethods = [
        {},
        { id: 'test' },
        { title: 'test' },
        { method_name: 'test' },
        { payment_method: 'test' }
      ]
      
      for (const method of testMethods) {
        const { data: insertData, error: insertError } = await supabase
          .from('payment_methods')
          .insert([method])
          .select()
        
        if (insertError) {
          console.log(`❌ Insert ${JSON.stringify(method)} failed:`, insertError.message)
        } else {
          console.log(`✅ Insert ${JSON.stringify(method)} succeeded:`, insertData)
          // Clean up
          if (insertData && insertData[0] && insertData[0].id) {
            await supabase.from('payment_methods').delete().eq('id', insertData[0].id)
          }
        }
      }
      
    } else {
      console.log('\n📊 payment_methods table structure:')
      data?.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
    }
    
  } catch (error) {
    console.error('Error inspecting payment_methods:', error)
  }
}

inspectPaymentMethods() 