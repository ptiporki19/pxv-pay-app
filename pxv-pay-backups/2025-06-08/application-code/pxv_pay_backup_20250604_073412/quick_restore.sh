#!/bin/bash

echo "🔄 PXV Pay Quick Restore"
echo "======================="

# Navigate to parent directory
cd ..

echo "🛑 Stopping Supabase..."
npx supabase stop

echo "🚀 Starting Supabase..."
npx supabase start

echo "🔄 Resetting database..."
npx supabase db reset --no-seed

echo "📊 Restoring database..."
BACKUP_DIR=$(basename "$PWD")
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < "$BACKUP_DIR/database_complete.sql"

echo "🗄️ Restoring storage buckets..."
cd "$BACKUP_DIR"
node restore_storage_buckets.js

echo "👤 Restoring super admin..."
node restore_super_admin.js

echo "📁 Copying configuration files..."
cp .env.local ../
if [ -f "config.toml" ]; then
    cp config.toml ../supabase/
fi

echo "✅ Restore completed!"
echo "🚀 Frontend: http://localhost:3000"
echo "👤 Admin: admin@pxvpay.com / admin123456"
