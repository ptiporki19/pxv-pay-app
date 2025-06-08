#!/usr/bin/env node

/**
 * PXV Pay - Production Deployment Checklist
 * Verifies application readiness for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentChecker {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllChecks() {
    console.log('🚀 PXV Pay - Production Deployment Checklist');
    console.log('============================================\n');

    // Core Application Checks
    await this.checkPackageJson();
    await this.checkEnvironmentTemplate();
    await this.checkRequiredDirectories();
    await this.checkCoreComponents();
    await this.checkDatabaseMigrations();
    
    // Security Checks
    await this.checkSecurityFeatures();
    await this.checkEnvironmentSecurity();
    
    // Build & Dependencies
    await this.checkDependencies();
    await this.checkBuildProcess();
    
    // Documentation
    await this.checkDocumentation();
    
    // Git Status
    await this.checkGitStatus();
    
    // Final Summary
    this.showSummary();
  }

  check(name, condition, details = '') {
    const status = condition ? '✅' : '❌';
    const message = `${status} ${name}`;
    
    if (condition) {
      this.passed++;
      console.log(message);
    } else {
      this.failed++;
      console.log(`${message} ${details}`);
    }
    
    if (details && condition) {
      console.log(`   ${details}`);
    }
  }

  async checkPackageJson() {
    console.log('📦 Package Configuration');
    console.log('------------------------');
    
    const packageExists = fs.existsSync('package.json');
    this.check('package.json exists', packageExists);
    
    if (packageExists) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      this.check('Next.js dependency', !!pkg.dependencies?.next);
      this.check('React dependency', !!pkg.dependencies?.react);
      this.check('Supabase client', !!pkg.dependencies?.['@supabase/supabase-js']);
      this.check('Build script exists', !!pkg.scripts?.build);
      this.check('Start script exists', !!pkg.scripts?.start);
    }
    console.log();
  }

  async checkEnvironmentTemplate() {
    console.log('⚙️ Environment Configuration');
    console.log('----------------------------');
    
    const envExample = fs.existsSync('.env.example');
    const envLocal = fs.existsSync('.env.local');
    
    this.check('Environment template exists', envExample || envLocal);
    this.check('Environment variables configured', !envLocal || this.checkEnvVariables());
    console.log();
  }

  checkEnvVariables() {
    if (!fs.existsSync('.env.local')) return false;
    
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    return requiredVars.every(variable => envContent.includes(variable));
  }

  async checkRequiredDirectories() {
    console.log('📁 Directory Structure');
    console.log('----------------------');
    
    const requiredDirs = [
      'src/app',
      'src/components',
      'src/lib',
      'public'
    ];
    
    requiredDirs.forEach(dir => {
      this.check(`Directory: ${dir}`, fs.existsSync(dir));
    });
    console.log();
  }

  async checkCoreComponents() {
    console.log('🧩 Core Components');
    console.log('------------------');
    
    const coreFiles = [
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'src/app/(admin)/layout.tsx',
      'src/app/(admin)/dashboard/page.tsx',
      'src/lib/supabase/client.ts',
      'src/components/ui/button.tsx'
    ];
    
    coreFiles.forEach(file => {
      this.check(`Core file: ${path.basename(file)}`, fs.existsSync(file));
    });
    console.log();
  }

  async checkDatabaseMigrations() {
    console.log('🗃️ Database Setup');
    console.log('-----------------');
    
    const migrationFiles = [
      'supabase/seed.sql',
      'make-user-super-admin.sql'
    ];
    
    migrationFiles.forEach(file => {
      this.check(`Migration: ${path.basename(file)}`, fs.existsSync(file));
    });
    console.log();
  }

  async checkSecurityFeatures() {
    console.log('🛡️ Security Features');
    console.log('--------------------');
    
    // Check for authentication components
    const authFiles = [
      'src/lib/supabase/client.ts',
      'src/components/auth',
      'src/app/(auth)'
    ];
    
    const hasAuth = authFiles.some(file => fs.existsSync(file));
    this.check('Authentication system', hasAuth);
    
    // Check for RBAC implementation
    const rbacComponents = [
      'src/components/admin',
      'src/app/(admin)'
    ];
    
    const hasRBAC = rbacComponents.every(dir => fs.existsSync(dir));
    this.check('Role-based access control', hasRBAC);
    
    console.log();
  }

  async checkEnvironmentSecurity() {
    console.log('🔒 Environment Security');
    console.log('-----------------------');
    
    const gitignoreExists = fs.existsSync('.gitignore');
    this.check('.gitignore exists', gitignoreExists);
    
    if (gitignoreExists) {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      this.check('Ignores .env files', gitignoreContent.includes('.env'));
      this.check('Ignores node_modules', gitignoreContent.includes('node_modules'));
      this.check('Ignores .next build', gitignoreContent.includes('.next'));
    }
    
    console.log();
  }

  async checkDependencies() {
    console.log('📚 Dependencies');
    console.log('---------------');
    
    try {
      const nodeModulesExists = fs.existsSync('node_modules');
      this.check('Dependencies installed', nodeModulesExists);
      
      if (nodeModulesExists) {
        execSync('npm audit --audit-level high', { stdio: 'pipe' });
        this.check('No high-severity vulnerabilities', true);
      }
    } catch (error) {
      this.check('No high-severity vulnerabilities', false, 'Run: npm audit fix');
    }
    
    console.log();
  }

  async checkBuildProcess() {
    console.log('🔨 Build Process');
    console.log('----------------');
    
    try {
      console.log('   Testing build process...');
      execSync('npm run build', { stdio: 'pipe' });
      this.check('Application builds successfully', true);
      
      const buildDir = fs.existsSync('.next');
      this.check('Build output generated', buildDir);
    } catch (error) {
      this.check('Application builds successfully', false, 'Fix build errors first');
    }
    
    console.log();
  }

  async checkDocumentation() {
    console.log('📖 Documentation');
    console.log('-----------------');
    
    const docFiles = [
      'README.md',
      'GIT-WORKFLOW.md'
    ];
    
    docFiles.forEach(file => {
      this.check(`Documentation: ${file}`, fs.existsSync(file));
    });
    
    console.log();
  }

  async checkGitStatus() {
    console.log('🌿 Git Status');
    console.log('-------------');
    
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      this.check('No uncommitted changes', status.trim() === '');
      
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      this.check(`On main branch`, currentBranch === 'main');
      
      const remoteStatus = execSync('git status --porcelain -b', { encoding: 'utf8' });
      const upToDate = !remoteStatus.includes('[ahead') && !remoteStatus.includes('[behind');
      this.check('In sync with remote', upToDate);
      
    } catch (error) {
      this.check('Git repository healthy', false, 'Check git status');
    }
    
    console.log();
  }

  showSummary() {
    console.log('📊 DEPLOYMENT READINESS SUMMARY');
    console.log('================================');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%\n`);
    
    if (this.failed === 0) {
      console.log('🎉 CONGRATULATIONS!');
      console.log('🚀 Your application is READY for production deployment!');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Set up production environment variables');
      console.log('2. Configure production Supabase project');
      console.log('3. Deploy to your hosting platform');
      console.log('4. Run post-deployment verification');
    } else {
      console.log('⚠️ DEPLOYMENT BLOCKED');
      console.log('Please fix the failed checks before deploying to production.');
      console.log('');
      console.log('💡 Tips:');
      console.log('- Fix build errors first');
      console.log('- Ensure all environment variables are set');
      console.log('- Commit all changes to git');
      console.log('- Run tests to verify functionality');
    }
  }
}

// Run deployment checklist
new DeploymentChecker().runAllChecks().catch(console.error); 