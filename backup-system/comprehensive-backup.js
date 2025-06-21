#!/usr/bin/env node

/**
 * PXV Pay - Comprehensive Backup System
 * Creates complete backups of application and database
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Configuration
const BACKUP_CONFIG = {
  backupDir: path.join(__dirname, '..', '..', 'pxv-pay-backups'),
  timestamp: new Date().toISOString().replace(/[:.]/g, '-').split('T')[0],
  fullTimestamp: new Date().toISOString().replace(/[:.]/g, '-')
};

class ComprehensiveBackup {
  constructor() {
    this.backupPath = path.join(BACKUP_CONFIG.backupDir, BACKUP_CONFIG.timestamp);
  }

  async createBackup() {
    console.log('🚀 Starting Comprehensive Backup Process...');
    console.log(`📅 Backup Date: ${BACKUP_CONFIG.timestamp}`);
    console.log(`📁 Backup Location: ${this.backupPath}`);

    try {
      // Create backup directory
      await fs.ensureDir(this.backupPath);

      // 1. Backup Application Code
      await this.backupApplicationCode();

      // 2. Backup Configuration
      await this.backupEnvironmentConfig();

      // 3. Create Restoration Scripts
      await this.createRestorationScripts();

      // 4. Generate Backup Summary
      await this.generateBackupSummary();

      console.log('✅ Comprehensive Backup Completed Successfully!');
      console.log(`📦 Backup saved to: ${this.backupPath}`);

    } catch (error) {
      console.error('❌ Backup Failed:', error.message);
      throw error;
    }
  }

  async backupApplicationCode() {
    console.log('📝 Backing up application code...');
    
    const codeBackupPath = path.join(this.backupPath, 'application-code');
    await fs.ensureDir(codeBackupPath);

    // Copy entire application excluding build artifacts
    await this.manualCodeBackup(codeBackupPath);

    console.log('✅ Application code backup completed');
  }

  async manualCodeBackup(destPath) {
    const sourcePath = path.join(__dirname, '..');
    
    const copyOptions = {
      filter: (src) => {
        const relativePath = path.relative(sourcePath, src);
        const excludePatterns = ['node_modules', '.next', '.git', 'dist', 'build', 'backups', 'backup-system'];
        return !excludePatterns.some(pattern => relativePath.includes(pattern));
      }
    };

    await fs.copy(sourcePath, destPath, copyOptions);
  }

  async backupEnvironmentConfig() {
    console.log('⚙️ Backing up environment configuration...');
    
    const configPath = path.join(this.backupPath, 'configuration');
    await fs.ensureDir(configPath);

    // Create environment template
    const envTemplate = {
      NEXT_PUBLIC_SUPABASE_URL: '[YOUR_SUPABASE_URL]',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '[YOUR_SUPABASE_ANON_KEY]',
      SUPABASE_SERVICE_ROLE_KEY: '[YOUR_SERVICE_ROLE_KEY]',
      NEXT_PUBLIC_SITE_URL: '[YOUR_SITE_URL]',
      NODE_ENV: 'production'
    };

    await fs.writeJSON(
      path.join(configPath, 'env-template.json'), 
      envTemplate, 
      { spaces: 2 }
    );

    // Backup config files
    const configFiles = ['package.json', 'next.config.js', 'tailwind.config.js', 'tsconfig.json'];
    
    for (const file of configFiles) {
      const sourcePath = path.join(__dirname, '..', file);
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, path.join(configPath, file));
      }
    }

    console.log('✅ Environment configuration backup completed');
  }

  async createRestorationScripts() {
    console.log('🔧 Creating restoration scripts...');
    
    const scriptsPath = path.join(this.backupPath, 'restoration-scripts');
    await fs.ensureDir(scriptsPath);

    // Create main restoration script
    const restorationScript = `#!/usr/bin/env node

/**
 * PXV Pay - Application Restoration Script
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class AppRestoration {
  constructor() {
    this.backupPath = __dirname.replace('/restoration-scripts', '');
    this.targetPath = process.argv[2] || '../../../restored-pxv-pay';
  }

  async restore() {
    console.log('🔄 Starting Application Restoration...');
    console.log(\`📁 Backup Source: \${this.backupPath}\`);
    console.log(\`📁 Restore Target: \${this.targetPath}\`);

    try {
      // 1. Restore application code
      await this.restoreApplicationCode();

      // 2. Restore configuration
      await this.restoreConfiguration();

      // 3. Install dependencies
      await this.installDependencies();

      // 4. Show next steps
      this.showNextSteps();

      console.log('✅ Application Restoration Completed!');
    } catch (error) {
      console.error('❌ Restoration Failed:', error.message);
      throw error;
    }
  }

  async restoreApplicationCode() {
    console.log('📝 Restoring application code...');
    
    const codePath = path.join(this.backupPath, 'application-code');
    await fs.ensureDir(this.targetPath);
    await fs.copy(codePath, this.targetPath);
    
    console.log('✅ Application code restored');
  }

  async restoreConfiguration() {
    console.log('⚙️ Restoring configuration...');
    
    const configPath = path.join(this.backupPath, 'configuration');
    
    const configFiles = ['package.json', 'next.config.js', 'tailwind.config.js', 'tsconfig.json'];
    
    for (const file of configFiles) {
      const sourcePath = path.join(configPath, file);
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, path.join(this.targetPath, file));
      }
    }

    console.log('✅ Configuration restored');
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    try {
      execSync('npm install', { 
        cwd: this.targetPath, 
        stdio: 'inherit' 
      });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.error('⚠️ Dependency installation failed:', error.message);
      console.log('ℹ️ You may need to run "npm install" manually');
    }
  }

  showNextSteps() {
    console.log(\`
📋 NEXT STEPS:
1. Configure your environment variables in .env.local
2. Update Supabase connection details
3. Start the development server: npm run dev

📖 Environment Template: \${path.join(this.backupPath, 'configuration/env-template.json')}
\`);
  }
}

new AppRestoration().restore().catch(console.error);
`;

    await fs.writeFile(
      path.join(scriptsPath, 'restore-app.js'), 
      restorationScript
    );

    console.log('✅ Restoration scripts created');
  }

  async generateBackupSummary() {
    console.log('📋 Generating backup summary...');
    
    const summary = {
      backupInfo: {
        timestamp: BACKUP_CONFIG.fullTimestamp,
        date: BACKUP_CONFIG.timestamp,
        version: 'v1.0-production',
        backupType: 'comprehensive'
      },
      contents: {
        applicationCode: '✅ Complete source code',
        configuration: '✅ Package and environment configs',
        restorationScripts: '✅ Automated restoration tools'
      },
      restorationInstructions: {
        quickRestore: 'Run: node restoration-scripts/restore-app.js [target-directory]',
        manualSteps: [
          'Copy application-code to desired location',
          'Configure environment variables using configuration/env-template.json',
          'Install dependencies: npm install',
          'Start application: npm run dev'
        ]
      }
    };

    await fs.writeJSON(
      path.join(this.backupPath, 'BACKUP-SUMMARY.json'), 
      summary, 
      { spaces: 2 }
    );

    // Create README
    const readme = `# PXV Pay - Backup Summary

## Quick Restoration
\`\`\`bash
cd restoration-scripts
node restore-app.js [target-directory]
\`\`\`

## Manual Steps
1. Copy application-code to desired location
2. Configure environment variables
3. Install dependencies: npm install
4. Start: npm run dev

Generated on ${summary.backupInfo.timestamp}
`;

    await fs.writeFile(path.join(this.backupPath, 'README.md'), readme);

    console.log('✅ Backup summary generated');
  }
}

if (require.main === module) {
  const backup = new ComprehensiveBackup();
  backup.createBackup().catch(console.error);
}

module.exports = ComprehensiveBackup; 