# Storage Buckets and RLS Policies Backup

Generated: 2025-05-25T01:27:38.956Z

## Contents

- buckets_data.json - Storage buckets configuration
- policies_data.json - RLS policies data

## Restore Instructions

Use the existing restore scripts:
- For buckets: node pxv_pay_backup_20250524_163521/restore_storage_buckets.js
- For policies: node apply-rls-policies.js

## Backup Summary

- Storage Buckets: 5
- RLS Policies: 54
- Tables: users, payments, countries, currencies, payment_methods
