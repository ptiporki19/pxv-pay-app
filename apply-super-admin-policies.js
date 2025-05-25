const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySuperAdminPolicies() {
  console.log('🚀 Applying Super Admin RLS Policies...\n')
  
  try {
    // List of policies to create
    const policies = [
      {
        name: 'super_admin_view_all_payments',
        table: 'payments',
        sql: `CREATE POLICY "super_admin_view_all_payments" 
              ON public.payments 
              FOR SELECT 
              TO authenticated 
              USING (
                EXISTS (
                  SELECT 1 FROM public.users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'super_admin'
                )
              );`
      },
      {
        name: 'super_admin_view_all_countries',
        table: 'countries', 
        sql: `CREATE POLICY "super_admin_view_all_countries" 
              ON public.countries 
              FOR SELECT 
              TO authenticated 
              USING (
                EXISTS (
                  SELECT 1 FROM public.users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'super_admin'
                )
              );`
      },
      {
        name: 'super_admin_view_all_currencies',
        table: 'currencies',
        sql: `CREATE POLICY "super_admin_view_all_currencies" 
              ON public.currencies 
              FOR SELECT 
              TO authenticated 
              USING (
                EXISTS (
                  SELECT 1 FROM public.users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'super_admin'
                )
              );`
      },
      {
        name: 'super_admin_view_all_payment_methods',
        table: 'payment_methods',
        sql: `CREATE POLICY "super_admin_view_all_payment_methods" 
              ON public.payment_methods 
              FOR SELECT 
              TO authenticated 
              USING (
                EXISTS (
                  SELECT 1 FROM public.users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'super_admin'
                )
              );`
      }
    ]

    // Apply each policy
    for (const policy of policies) {
      console.log(`📝 Creating policy: ${policy.name}`)
      
      // First drop if exists
      try {
        const dropResult = await supabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policy.name}" ON public.${policy.table};`
        })
        
        if (dropResult.error && !dropResult.error.message.includes('does not exist')) {
          console.log(`⚠️  Warning dropping policy ${policy.name}:`, dropResult.error.message)
        }
      } catch (error) {
        console.log(`⚠️  Warning dropping policy ${policy.name}:`, error.message)
      }
      
      // Create the policy
      try {
        const createResult = await supabase.rpc('exec_sql', {
          sql: policy.sql
        })
        
        if (createResult.error) {
          console.log(`❌ Error creating policy ${policy.name}:`, createResult.error.message)
        } else {
          console.log(`✅ Policy ${policy.name} created successfully`)
        }
      } catch (error) {
        console.log(`❌ Exception creating policy ${policy.name}:`, error.message)
      }
    }

    console.log('\n🎉 Super Admin Policies Migration Complete!')
    console.log('Super admins can now view all user data for profile management.')

  } catch (error) {
    console.error('💥 Error applying super admin policies:', error)
    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  applySuperAdminPolicies()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

module.exports = { applySuperAdminPolicies } 