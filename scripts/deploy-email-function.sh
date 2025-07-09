#!/bin/bash

# Deploy Email Function to Supabase
# This script deploys the send-email Edge Function

echo "🚀 Deploying send-email Edge Function to Supabase..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ No supabase/config.toml found. Make sure you're in the project root."
    exit 1
fi

# Deploy the function
echo "📦 Deploying send-email function..."
supabase functions deploy send-email

if [ $? -eq 0 ]; then
    echo "✅ Email function deployed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up environment variables in your Supabase project:"
    echo "   - SENDGRID_API_KEY (for SendGrid)"
    echo "   - FROM_EMAIL (default sender email)"
    echo "   - FROM_NAME (default sender name)"
    echo ""
    echo "2. Alternative SMTP configuration:"
    echo "   - SMTP_HOST"
    echo "   - SMTP_PORT"
    echo "   - SMTP_USER"
    echo "   - SMTP_PASS"
    echo ""
    echo "3. Update your app's environment with:"
    echo "   - NEXT_PUBLIC_APP_URL (for dashboard links in emails)"
    echo ""
    echo "📖 The function is now available at:"
    echo "   https://your-project.supabase.co/functions/v1/send-email"
else
    echo "❌ Function deployment failed!"
    exit 1
fi 