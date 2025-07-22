#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mobile pages to update (excluding dashboard which is already done)
const mobilePages = [
  'src/app/m/layout.tsx',
  'src/app/m/admin/layout.tsx',
  'src/app/m/brands/page.tsx',
  'src/app/m/brands/create/page.tsx',
  'src/app/m/brands/edit/[id]/page.tsx',
  'src/app/m/checkout-links/page.tsx',
  'src/app/m/checkout-links/create/page.tsx',
  'src/app/m/checkout-links/edit/[id]/page.tsx',
  'src/app/m/payment-methods/page.tsx',
  'src/app/m/payment-methods/create/page.tsx',
  'src/app/m/payment-methods/edit/[id]/page.tsx',
  'src/app/m/products/page.tsx',
  'src/app/m/products/create/page.tsx',
  'src/app/m/products/edit/[id]/page.tsx',
  'src/app/m/profile/page.tsx',
  'src/app/m/settings/page.tsx',
  'src/app/m/verification/page.tsx',
  'src/app/m/verification/[id]/page.tsx'
];

// Typography replacements
const typographyReplacements = [
  // Font weight replacements
  { from: /font-bold/g, to: 'font-normal' },
  { from: /font-semibold/g, to: 'font-normal' },
  { from: /font-medium(?!\s*text-)/g, to: 'font-normal' }, // Don't replace font-medium when followed by text-
  
  // Text size adjustments for better mobile readability
  { from: /text-lg font-/g, to: 'text-base font-' },
  { from: /text-xl font-/g, to: 'text-lg font-' },
  { from: /text-2xl font-/g, to: 'text-xl font-' },
  
  // Button typography
  { from: /className="([^"]*?)font-bold([^"]*?)"/g, to: 'className="$1font-normal$2"' },
  { from: /className="([^"]*?)font-semibold([^"]*?)"/g, to: 'className="$1font-normal$2"' },
  { from: /className="([^"]*?)font-medium([^"]*?)"/g, to: 'className="$1font-normal$2"' },
  
  // Heading typography (h1, h2, h3, h4, h5, h6)
  { from: /<h1 className="([^"]*?)font-bold([^"]*?)"/g, to: '<h1 className="$1font-normal$2"' },
  { from: /<h1 className="([^"]*?)font-semibold([^"]*?)"/g, to: '<h1 className="$1font-normal$2"' },
  { from: /<h1 className="([^"]*?)font-medium([^"]*?)"/g, to: '<h1 className="$1font-normal$2"' },
  
  { from: /<h2 className="([^"]*?)font-bold([^"]*?)"/g, to: '<h2 className="$1font-normal$2"' },
  { from: /<h2 className="([^"]*?)font-semibold([^"]*?)"/g, to: '<h2 className="$1font-normal$2"' },
  { from: /<h2 className="([^"]*?)font-medium([^"]*?)"/g, to: '<h2 className="$1font-normal$2"' },
  
  { from: /<h3 className="([^"]*?)font-bold([^"]*?)"/g, to: '<h3 className="$1font-normal$2"' },
  { from: /<h3 className="([^"]*?)font-semibold([^"]*?)"/g, to: '<h3 className="$1font-normal$2"' },
  { from: /<h3 className="([^"]*?)font-medium([^"]*?)"/g, to: '<h3 className="$1font-normal$2"' },
  
  { from: /<h4 className="([^"]*?)font-bold([^"]*?)"/g, to: '<h4 className="$1font-normal$2"' },
  { from: /<h4 className="([^"]*?)font-semibold([^"]*?)"/g, to: '<h4 className="$1font-normal$2"' },
  { from: /<h4 className="([^"]*?)font-medium([^"]*?)"/g, to: '<h4 className="$1font-normal$2"' },
  
  { from: /<h5 className="([^"]*?)font-bold([^"]*?)"/g, to: '<h5 className="$1font-normal$2"' },
  { from: /<h5 className="([^"]*?)font-semibold([^"]*?)"/g, to: '<h5 className="$1font-normal$2"' },
  { from: /<h5 className="([^"]*?)font-medium([^"]*?)"/g, to: '<h5 className="$1font-normal$2"' },
  
  { from: /<h6 className="([^"]*?)font-bold([^"]*?)"/g, to: '<h6 className="$1font-normal$2"' },
  { from: /<h6 className="([^"]*?)font-semibold([^"]*?)"/g, to: '<h6 className="$1font-normal$2"' },
  { from: /<h6 className="([^"]*?)font-medium([^"]*?)"/g, to: '<h6 className="$1font-normal$2"' },
  
  // Text within cards (adjusting for common card structures)
  { from: /<p className="text-sm font-medium text-card-foreground/g, to: '<p className="text-sm font-normal text-card-foreground' },
  { from: /<p className="text-sm font-bold text-card-foreground/g, to: '<p className="text-sm font-normal text-card-foreground' },
  { from: /<p className="text-sm font-semibold text-card-foreground/g, to: '<p className="text-sm font-normal text-card-foreground' },
  
  { from: /<p className="text-xs font-medium text-muted-foreground/g, to: '<p className="text-xs font-normal text-muted-foreground' },
  { from: /<p className="text-xs font-bold text-muted-foreground/g, to: '<p className="text-xs font-normal text-muted-foreground' },
  { from: /<p className="text-xs font-semibold text-muted-foreground/g, to: '<p className="text-xs font-normal text-muted-foreground' },
  
  // Text within buttons (if not already covered by className replacement)
  { from: /<button[^>]*? className="([^"]*?)font-bold([^"]*?)"[^>]*?>([\s\S]*?)<\/button>/g, to: '<button className="$1font-normal$2">$3</button>' },
  { from: /<button[^>]*? className="([^"]*?)font-semibold([^"]*?)"[^>]*?>([\s\S]*?)<\/button>/g, to: '<button className="$1font-normal$2">$3</button>' },
  { from: /<button[^>]*? className="([^"]*?)font-medium([^"]*?)"[^>]*?>([\s\S]*?)<\/button>/g, to: '<button className="$1font-normal$2">$3</button>' },
];

// Loading spinner replacement - standardize to match mobile dashboard
const loadingSpinnerReplacements = [
  // Replace various loading spinner patterns with consistent mobile dashboard style
  {
    from: /<div className="[^"]*animate-spin[^"]*"[^>]*>[\s\S]*?<\/div>/g,
    to: '<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>'
  },
  {
    from: /<div className="[^"]*loading[^"]*"[^>]*>[\s\S]*?<\/div>/g,
    to: '<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>'
  },
  // Replace loading text patterns
  {
    from: /Loading\.\.\./g,
    to: 'Loading...'
  },
  {
    from: /"Loading [^"]*"/g,
    to: '"Loading..."'
  }
];

// Standard loading component template
const standardLoadingComponent = `
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
`;

function applyTypographyFixes(content) {
  let updatedContent = content;
  
  // Apply typography replacements
  typographyReplacements.forEach(replacement => {
    updatedContent = updatedContent.replace(replacement.from, replacement.to);
  });
  
  // Apply loading spinner replacements
  loadingSpinnerReplacements.forEach(replacement => {
    updatedContent = updatedContent.replace(replacement.from, replacement.to);
  });
  
  // Replace common loading patterns with standard component
  updatedContent = updatedContent.replace(
    /return \(\s*<div className="[^"]*loading[^"]*"[\s\S]*?<\/div>\s*\)/g,
    `return (${standardLoadingComponent.trim()}    )`
  );
  
  return updatedContent;
}

function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = applyTypographyFixes(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`📝 No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Starting mobile typography consistency script...\n');
  
  let updatedCount = 0;
  let totalCount = 0;
  
  mobilePages.forEach(filePath => {
    totalCount++;
    if (processFile(filePath)) {
      updatedCount++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files processed: ${totalCount}`);
  console.log(`   Files updated: ${updatedCount}`);
  console.log(`   Files unchanged: ${totalCount - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n🎉 Typography consistency applied successfully!');
    console.log('📝 Changes made:');
    console.log('   • Replaced bold/semibold typography with regular weight');
    console.log('   • Standardized loading spinners');
    console.log('   • Improved mobile text sizing');
    console.log('   • Consistent button typography');
  } else {
    console.log('\n✨ All files already have consistent typography!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { applyTypographyFixes, processFile };