#!/bin/bash

# PXV Pay Database Restore Script
# Usage: ./restore-from-backup.sh [backup_file.sql]

echo "🔄 PXV Pay Database Restore Script"
echo "=================================="

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "📁 Available backup files:"
    ls -la supabase_*backup*.sql 2>/dev/null || echo "No backup files found"
    echo ""
    echo "Usage: ./restore-from-backup.sh [backup_file.sql]"
    echo "Example: ./restore-from-backup.sh supabase_full_backup_20250524_160022.sql"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file '$BACKUP_FILE' not found!"
    exit 1
fi

echo "📂 Using backup file: $BACKUP_FILE"
echo "⚠️  This will reset your local database and restore from backup."
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled."
    exit 1
fi

echo "🔄 Stopping Supabase..."
npx supabase stop

echo "🔄 Starting Supabase..."
npx supabase start

echo "🔄 Resetting database..."
npx supabase db reset --no-seed

echo "🔄 Restoring from backup..."
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully from $BACKUP_FILE"
    echo "🔧 Don't forget to recreate storage buckets and super admin if needed"
else
    echo "❌ Restore failed!"
    exit 1
fi 