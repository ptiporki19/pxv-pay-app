const { createClient } = require('@supabase/supabase-js')

console.log('🔐 Restoring storage RLS policies...')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function restoreStorageRLS() {
  try {
    console.log('\n📋 Creating storage RLS policies...')

    const policies = [
      // Payment Proofs bucket policies (private)
      {
        name: "Users can upload their own payment proofs",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('payment-proofs-upload-own', 'payment-proofs', 'INSERT', 
               'bucket_id = ''payment-proofs'' AND (auth.uid()::text = (storage.foldername(name))[1])')`
      },
      {
        name: "Users can view their own payment proofs",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('payment-proofs-select-own', 'payment-proofs', 'SELECT', 
               'bucket_id = ''payment-proofs'' AND (auth.uid()::text = (storage.foldername(name))[1])')`
      },
      {
        name: "Users can update their own payment proofs",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('payment-proofs-update-own', 'payment-proofs', 'UPDATE', 
               'bucket_id = ''payment-proofs'' AND (auth.uid()::text = (storage.foldername(name))[1])')`
      },
      {
        name: "Users can delete their own payment proofs",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('payment-proofs-delete-own', 'payment-proofs', 'DELETE', 
               'bucket_id = ''payment-proofs'' AND (auth.uid()::text = (storage.foldername(name))[1])')`
      },
      {
        name: "Super admins can access all payment proofs",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('payment-proofs-admin-all', 'payment-proofs', 'ALL', 
               'bucket_id = ''payment-proofs'' AND auth.email() = ''admin@pxvpay.com''')`
      },

      // Merchant Logos bucket policies (public)
      {
        name: "Anyone can view merchant logos",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('merchant-logos-select-public', 'merchant-logos', 'SELECT', 
               'bucket_id = ''merchant-logos''')`
      },
      {
        name: "Authenticated users can upload merchant logos",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('merchant-logos-insert-auth', 'merchant-logos', 'INSERT', 
               'bucket_id = ''merchant-logos'' AND auth.role() = ''authenticated''')`
      },
      {
        name: "Super admins can manage merchant logos",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('merchant-logos-admin-all', 'merchant-logos', 'ALL', 
               'bucket_id = ''merchant-logos'' AND auth.email() = ''admin@pxvpay.com''')`
      },

      // Payment Method Icons bucket policies (public)
      {
        name: "Anyone can view payment method icons",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('payment-method-icons-select-public', 'payment-method-icons', 'SELECT', 
               'bucket_id = ''payment-method-icons''')`
      },
      {
        name: "Authenticated users can upload payment method icons",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('payment-method-icons-insert-auth', 'payment-method-icons', 'INSERT', 
               'bucket_id = ''payment-method-icons'' AND auth.role() = ''authenticated''')`
      },
      {
        name: "Super admins can manage payment method icons",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('payment-method-icons-admin-all', 'payment-method-icons', 'ALL', 
               'bucket_id = ''payment-method-icons'' AND auth.email() = ''admin@pxvpay.com''')`
      },

      // User Avatars bucket policies (private)
      {
        name: "Users can upload their own avatar",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('user-avatars-upload-own', 'user-avatars', 'INSERT', 
               'bucket_id = ''user-avatars'' AND (auth.uid()::text = (storage.foldername(name))[1])')`
      },
      {
        name: "Users can view their own avatar",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('user-avatars-select-own', 'user-avatars', 'SELECT', 
               'bucket_id = ''user-avatars'' AND (auth.uid()::text = (storage.foldername(name))[1])')`
      },
      {
        name: "Users can update their own avatar",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('user-avatars-update-own', 'user-avatars', 'UPDATE', 
               'bucket_id = ''user-avatars'' AND (auth.uid()::text = (storage.foldername(name))[1])')`
      },
      {
        name: "Users can delete their own avatar",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('user-avatars-delete-own', 'user-avatars', 'DELETE', 
               'bucket_id = ''user-avatars'' AND (auth.uid()::text = (storage.foldername(name))[1])')`
      },
      {
        name: "Super admins can access all user avatars",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('user-avatars-admin-all', 'user-avatars', 'ALL', 
               'bucket_id = ''user-avatars'' AND auth.email() = ''admin@pxvpay.com''')`
      },

      // Blog Images bucket policies (public)
      {
        name: "Anyone can view blog images",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('blog-images-select-public', 'blog-images', 'SELECT', 
               'bucket_id = ''blog-images''')`
      },
      {
        name: "Authenticated users can upload blog images",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('blog-images-insert-auth', 'blog-images', 'INSERT', 
               'bucket_id = ''blog-images'' AND auth.role() = ''authenticated''')`
      },
      {
        name: "Super admins can manage blog images",
        sql: `INSERT INTO storage.policies (id, bucket_id, command, definition) VALUES 
              ('blog-images-admin-all', 'blog-images', 'ALL', 
               'bucket_id = ''blog-images'' AND auth.email() = ''admin@pxvpay.com''')`
      }
    ]

    console.log(`\n🔄 Applying ${policies.length} storage RLS policies...`)

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('sql', { query: policy.sql })
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️  ${policy.name}: ${error.message}`)
        } else {
          console.log(`✅ ${policy.name}`)
        }
      } catch (err) {
        // Try alternative approach with direct SQL
        try {
          const { error: directError } = await supabase
            .from('storage.policies')
            .insert({
              id: policy.sql.match(/'([^']+)'/)[1],
              bucket_id: policy.sql.match(/'([^']+)'/g)[1].replace(/'/g, ''),
              command: policy.sql.match(/'([^']+)'/g)[2].replace(/'/g, ''),
              definition: policy.sql.split("'")[7]
            })
          
          if (directError && !directError.message.includes('already exists')) {
            console.log(`⚠️  ${policy.name}: ${directError.message}`)
          } else {
            console.log(`✅ ${policy.name}`)
          }
        } catch (err2) {
          console.log(`⚠️  ${policy.name}: Could not create policy`)
        }
      }
    }

    console.log('\n🧪 Testing storage bucket access...')
    
    // Test bucket listing
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError.message)
    } else {
      console.log(`✅ Storage buckets available: ${buckets.length}`)
      buckets.forEach((bucket, index) => {
        console.log(`   ${index + 1}. ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
      })
    }

  } catch (err) {
    console.error('💥 Storage RLS restoration failed:', err)
  }
}

restoreStorageRLS().then(() => {
  console.log('\n✅ Storage RLS policies restoration completed!')
  process.exit(0)
}) 