#!/bin/bash

echo "🚀 PXV Pay - Automated Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running from correct directory
if [ ! -f "COMPLETE_DEPLOYMENT_GUIDE.md" ]; then
    print_error "Please run this script from the combo-1 root directory"
    exit 1
fi

echo "📋 Step 1: Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
else
    print_status "Node.js found: $(node --version)"
fi

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
else
    print_status "Git found: $(git --version)"
fi

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI not found. Installing..."
    npm install -g supabase
    if [ $? -eq 0 ]; then
        print_status "Supabase CLI installed successfully"
    else
        print_error "Failed to install Supabase CLI. Please install manually: npm install -g supabase"
        exit 1
    fi
else
    print_status "Supabase CLI found: $(supabase --version)"
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm not found. Installing..."
    npm install -g pnpm
    if [ $? -eq 0 ]; then
        print_status "pnpm installed successfully"
    else
        print_error "Failed to install pnpm. Please install manually: npm install -g pnpm"
        exit 1
    fi
else
    print_status "pnpm found: $(pnpm --version)"
fi

echo ""
echo "📦 Step 2: Setting up project dependencies..."

# Install main project dependencies
print_status "Installing main project dependencies..."
npm install

# Initialize and update submodules
print_status "Initializing Git submodules..."
git submodule init
git submodule update

# Setup PXV Pay application
echo ""
echo "🔧 Step 3: Setting up PXV Pay application..."
cd pxv-pay

print_status "Installing PXV Pay dependencies..."
pnpm install

# Check for environment files
echo ""
echo "🔑 Step 4: Environment configuration check..."

if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    print_warning "Environment files not found."
    echo "Please copy environment-template.env to .env and .env.local and configure with your values."
    echo "Required variables:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - DATABASE_URL"
    echo "  - NEXTAUTH_SECRET"
    echo ""
    read -p "Press Enter after you've configured the environment files..."
else
    print_status "Environment files found"
fi

# Database restoration
echo ""
echo "🗄️  Step 5: Database restoration..."

# Find the most recent backup
BACKUP_DIR=$(ls -dt pxv_pay_backup_* 2>/dev/null | head -1)

if [ -z "$BACKUP_DIR" ]; then
    print_error "No backup directory found. Please ensure backup exists."
    exit 1
fi

print_status "Found backup: $BACKUP_DIR"

cd "$BACKUP_DIR"

# Make restore script executable
chmod +x quick_restore.sh

print_status "Running database restoration..."
./quick_restore.sh

if [ $? -eq 0 ]; then
    print_status "Database restored successfully"
else
    print_error "Database restoration failed. Please check the logs above."
    exit 1
fi

cd ..

echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "===================================="
echo ""
echo "📍 Next steps:"
echo "1. Start Supabase: supabase start"
echo "2. Start the application: pnpm dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔐 Admin access:"
echo "   Email: admin@pxvpay.com"
echo "   Password: admin123!"
echo ""
echo "📖 For detailed information, see COMPLETE_DEPLOYMENT_GUIDE.md"
echo ""
print_status "Your PXV Pay application is ready to use!" 