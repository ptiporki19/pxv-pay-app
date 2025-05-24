const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupPaymentMethodsTable() {
  console.log('🚀 Setting up Enhanced Payment Methods Table...\n')
  
  try {
    // 1. Create payment_methods table if it doesn't exist
    console.log('1️⃣ Creating payment_methods table...')
    
    const createTableResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS payment_methods (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('bank', 'mobile', 'crypto', 'payment-link', 'manual')),
          countries TEXT[] DEFAULT '{}',
          status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'inactive')),
          icon TEXT,
          instructions TEXT,
          url TEXT,
          description TEXT,
          custom_fields JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE(user_id, name)
        );
      `
    })
    
    if (createTableResult.error) {
      console.log('⚠️  Table creation result:', createTableResult.error.message)
    } else {
      console.log('✅ Payment methods table created/verified')
    }
    
    // 2. Add URL constraint for payment links
    console.log('\n2️⃣ Adding URL constraint...')
    
    const urlConstraintResult = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE payment_methods 
        DROP CONSTRAINT IF EXISTS payment_methods_url_required_for_links;
        
        ALTER TABLE payment_methods 
        ADD CONSTRAINT payment_methods_url_required_for_links 
        CHECK (
          (type = 'payment-link' AND url IS NOT NULL AND url != '') OR 
          (type != 'payment-link')
        );
      `
    })
    
    if (urlConstraintResult.error) {
      console.log('⚠️  URL constraint result:', urlConstraintResult.error.message)
    } else {
      console.log('✅ URL constraint added')
    }
    
    // 3. Enable RLS on payment_methods
    console.log('\n3️⃣ Enabling RLS...')
    
    const rlsResult = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;`
    })
    
    if (rlsResult.error) {
      console.log('⚠️  RLS enable result:', rlsResult.error.message)
    } else {
      console.log('✅ RLS enabled on payment_methods')
    }
    
    // 4. Create RLS policies
    console.log('\n4️⃣ Creating RLS policies...')
    
    const policies = [
      {
        name: 'Users can view their own payment methods',
        sql: `
          CREATE POLICY "Users can view their own payment methods"
          ON payment_methods
          FOR SELECT
          USING (auth.uid() = user_id);
        `
      },
      {
        name: 'Users can create their own payment methods',
        sql: `
          CREATE POLICY "Users can create their own payment methods"
          ON payment_methods
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);
        `
      },
      {
        name: 'Users can update their own payment methods',
        sql: `
          CREATE POLICY "Users can update their own payment methods"
          ON payment_methods
          FOR UPDATE
          USING (auth.uid() = user_id);
        `
      },
      {
        name: 'Users can delete their own payment methods',
        sql: `
          CREATE POLICY "Users can delete their own payment methods"
          ON payment_methods
          FOR DELETE
          USING (auth.uid() = user_id);
        `
      }
    ]
    
    for (const policy of policies) {
      const dropResult = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy.name}" ON payment_methods;`
      })
      
      const createResult = await supabase.rpc('exec_sql', {
        sql: policy.sql
      })
      
      if (createResult.error) {
        console.log(`⚠️  Policy "${policy.name}" result:`, createResult.error.message)
      } else {
        console.log(`✅ Policy "${policy.name}" created`)
      }
    }
    
    // 5. Create indexes for performance
    console.log('\n5️⃣ Creating indexes...')
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);',
      'CREATE INDEX IF NOT EXISTS payment_methods_type_idx ON payment_methods(type);',
      'CREATE INDEX IF NOT EXISTS payment_methods_status_idx ON payment_methods(status);'
    ]
    
    for (const indexSql of indexes) {
      const indexResult = await supabase.rpc('exec_sql', { sql: indexSql })
      if (indexResult.error) {
        console.log('⚠️  Index creation result:', indexResult.error.message)
      } else {
        console.log('✅ Index created')
      }
    }
    
    // 6. Create update timestamp function and trigger
    console.log('\n6️⃣ Creating timestamp trigger...')
    
    const timestampFunction = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = timezone('utc'::text, now());
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    })
    
    if (timestampFunction.error) {
      console.log('⚠️  Timestamp function result:', timestampFunction.error.message)
    } else {
      console.log('✅ Timestamp function created')
    }
    
    const timestampTrigger = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS payment_methods_update_timestamp ON payment_methods;
        CREATE TRIGGER payment_methods_update_timestamp
        BEFORE UPDATE ON payment_methods
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    })
    
    if (timestampTrigger.error) {
      console.log('⚠️  Timestamp trigger result:', timestampTrigger.error.message)
    } else {
      console.log('✅ Timestamp trigger created')
    }
    
    // 7. Test the table structure
    console.log('\n7️⃣ Testing table structure...')
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('payment_methods')
      .select('*')
      .limit(0)
    
    if (tableError) {
      console.log('❌ Table test failed:', tableError.message)
    } else {
      console.log('✅ Payment methods table is ready for use!')
    }
    
    console.log('\n🎉 Enhanced Payment Methods Table Setup Complete!')
    console.log('\n📝 Table Features:')
    console.log('   - User isolation with RLS policies')
    console.log('   - Support for manual payment methods with custom fields')
    console.log('   - Support for payment link methods')
    console.log('   - URL validation for payment links')
    console.log('   - Unique constraint on user_id + name')
    console.log('   - Automatic timestamps')
    console.log('   - Performance indexes')
    
  } catch (error) {
    console.error('❌ Setup failed with error:', error)
  }
}

setupPaymentMethodsTable() 