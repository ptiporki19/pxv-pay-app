const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  console.log('🚀 Applying enhanced payment methods migration...')
  
  const statements = [
    // Add user_id column
    `ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);`,
    
    // Add custom_fields column
    `ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb;`,
    
    // Add description column
    `ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS description TEXT;`,
    
    // Drop and recreate type constraint
    `ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS payment_methods_type_check;`,
    `ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_type_check CHECK (type IN ('bank', 'mobile', 'crypto', 'payment-link', 'manual'));`,
    
    // Drop and recreate URL constraint
    `ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS payment_methods_url_required_for_links;`,
    `ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_url_required_for_links CHECK ((type = 'payment-link' AND url IS NOT NULL AND url != '') OR (type != 'payment-link'));`,
    
    // Add unique constraint
    `ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS payment_methods_user_name_unique;`,
    `ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_user_name_unique UNIQUE(user_id, name);`,
    
    // Drop old policies
    `DROP POLICY IF EXISTS admin_payment_methods_policy ON payment_methods;`,
    `DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;`,
    `DROP POLICY IF EXISTS "Users can create their own payment methods" ON payment_methods;`,
    `DROP POLICY IF EXISTS "Users can update their own payment methods" ON payment_methods;`,
    `DROP POLICY IF EXISTS "Users can delete their own payment methods" ON payment_methods;`,
    `DROP POLICY IF EXISTS "Admins can view all payment methods" ON payment_methods;`,
    
    // Create new RLS policies
    `CREATE POLICY "Users can view their own payment methods" ON payment_methods FOR SELECT USING (auth.uid() = user_id);`,
    `CREATE POLICY "Users can create their own payment methods" ON payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `CREATE POLICY "Users can update their own payment methods" ON payment_methods FOR UPDATE USING (auth.uid() = user_id);`,
    `CREATE POLICY "Users can delete their own payment methods" ON payment_methods FOR DELETE USING (auth.uid() = user_id);`,
    `CREATE POLICY "Admins can view all payment methods" ON payment_methods FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));`,
    
    // Create indexes
    `CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);`,
    `CREATE INDEX IF NOT EXISTS payment_methods_type_idx ON payment_methods(type);`,
    `CREATE INDEX IF NOT EXISTS payment_methods_status_idx ON payment_methods(status);`
  ]
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    console.log(`📝 Executing statement ${i + 1}/${statements.length}...`)
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.log(`⚠️  Statement ${i + 1} warning:`, error.message)
      } else {
        console.log(`✅ Statement ${i + 1} completed successfully`)
      }
    } catch (error) {
      console.error(`❌ Error in statement ${i + 1}:`, error.message)
    }
  }
  
  console.log('🎉 Migration completed!')
}

applyMigration().catch(console.error) 