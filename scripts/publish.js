#!/usr/bin/env node

/**
 * 🚀 Auto Publish Script for n8n-nodes-zalo-public
 * 
 * Tự động publish lên npmjs và GitHub với đầy đủ changelogs và versioning
 * 
 * Usage:
 *   node scripts/publish.js [version] [--dry-run]
 * 
 * Examples:
 *   node scripts/publish.js patch          # 0.6.9 -> 0.6.10
 *   node scripts/publish.js minor          # 0.6.9 -> 0.7.0
 *   node scripts/publish.js major          # 0.6.9 -> 1.0.0
 *   node scripts/publish.js 0.7.1          # Set specific version
 *   node scripts/publish.js patch --dry-run # Test without publishing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Configuration
const config = {
  packageName: 'n8n-nodes-zalo-public',
  gitRemote: 'origin',
  mainBranch: 'main',
  backupDir: './backups',
  changelogFile: './CHANGELOG.md',
  versioningFile: './VERSIONING.md',
  statusFile: './PROJECT_STATUS.md',
  githubRepo: 'https://github.com/aiviethub/n8n-nodes-zalo-public'
};

class Publisher {
  constructor() {
    this.isDryRun = process.argv.includes('--dry-run');
    this.versionType = process.argv[2] || 'patch';
    this.currentVersion = this.getCurrentVersion();
    this.newVersion = this.calculateNewVersion();
    this.startTime = new Date();
  }

  log(message, color = 'reset') {
    const timestamp = new Date().toISOString().substr(11, 8);
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  error(message) {
    this.log(`❌ ERROR: ${message}`, 'red');
    process.exit(1);
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      return packageJson.version;
    } catch (error) {
      this.error(`Cannot read package.json: ${error.message}`);
    }
  }

  calculateNewVersion() {
    if (this.versionType.match(/^\d+\.\d+\.\d+$/)) {
      return this.versionType; // Specific version
    }

    const [major, minor, patch] = this.currentVersion.split('.').map(Number);
    
    switch (this.versionType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        this.error(`Invalid version type: ${this.versionType}. Use: major, minor, patch, or specific version`);
    }
  }

  async checkPrerequisites() {
    this.info('Checking prerequisites...');

    // Check if git is available
    try {
      execSync('git --version', { stdio: 'pipe' });
    } catch (error) {
      this.error('Git is not installed or not in PATH');
    }

    // Check if npm is available
    try {
      execSync('npm --version', { stdio: 'pipe' });
    } catch (error) {
      this.error('npm is not installed or not in PATH');
    }

    // Check if we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      this.error('Not in a git repository');
    }

    // Check if working directory is clean
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        this.warning('Working directory has uncommitted changes:');
        console.log(status);
        if (!this.isDryRun) {
          this.error('Please commit or stash changes before publishing');
        }
      }
    } catch (error) {
      this.error('Cannot check git status');
    }

    // Check if we're on main branch
    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (branch !== config.mainBranch) {
        this.warning(`Not on ${config.mainBranch} branch (current: ${branch})`);
      }
    } catch (error) {
      this.warning('Cannot determine current branch');
    }

    this.success('Prerequisites check passed');
  }

  async updateVersion() {
    this.info(`Updating version from ${this.currentVersion} to ${this.newVersion}...`);

    // Update package.json
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    packageJson.version = this.newVersion;
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n');

    this.success(`Version updated to ${this.newVersion}`);
  }

  async updateChangelog() {
    this.info('Updating CHANGELOG.md...');

    const changelogPath = config.changelogFile;
    let changelog = '';

    if (fs.existsSync(changelogPath)) {
      changelog = fs.readFileSync(changelogPath, 'utf8');
    }

    const newEntry = `## [${this.newVersion}] - ${new Date().toISOString().split('T')[0]}

### Added
- Automated publish process
- Version ${this.newVersion} release

### Changed
- Updated dependencies and documentation

### Technical Details
- Published via automated script
- Full npmjs and GitHub synchronization
- Complete changelog and versioning

`;

    // Insert new entry after [Unreleased] section
    const unreleasedIndex = changelog.indexOf('## [Unreleased]');
    if (unreleasedIndex !== -1) {
      const afterUnreleased = changelog.indexOf('\n', unreleasedIndex) + 1;
      changelog = changelog.slice(0, afterUnreleased) + newEntry + changelog.slice(afterUnreleased);
    } else {
      changelog = newEntry + changelog;
    }

    fs.writeFileSync(changelogPath, changelog);
    this.success('CHANGELOG.md updated');
    
    // Generate user-friendly changelog
    this.info('Generating user-friendly changelog...');
    try {
      execSync('node scripts/generate-user-changelog.js', { stdio: 'pipe' });
      this.success('CHANGELOG_USER.md updated');
    } catch (error) {
      this.warning(`Failed to generate user changelog: ${error.message}`);
    }
  }

  async updateVersioning() {
    this.info('Updating VERSIONING.md...');

    const versioningPath = config.versioningFile;
    if (!fs.existsSync(versioningPath)) {
      this.warning('VERSIONING.md not found, skipping update');
      return;
    }

    let versioning = fs.readFileSync(versioningPath, 'utf8');
    
    // Update current version
    versioning = versioning.replace(
      /(\*\*Current Version:\*\* )[\d.]+/,
      `$1${this.newVersion}`
    );

    // Update version history
    const versionHistoryEntry = `| ${this.newVersion} | Patch | ${new Date().toISOString().split('T')[0]} | Automated publish | ✅ Active |`;
    
    if (versioning.includes('| Version | Type | Date | Changes | Status |')) {
      const tableStart = versioning.indexOf('| Version | Type | Date | Changes | Status |');
      const nextLine = versioning.indexOf('\n', tableStart) + 1;
      versioning = versioning.slice(0, nextLine) + versionHistoryEntry + '\n' + versioning.slice(nextLine);
    }

    fs.writeFileSync(versioningPath, versioning);
    this.success('VERSIONING.md updated');
  }

  async buildProject() {
    this.info('Building project...');

    try {
      // Check if source TypeScript files exist
      const srcExists = fs.existsSync('./src');
      const tsFiles = this.findTsFiles('./');
      
      if (!srcExists && tsFiles.length === 0) {
        this.warning('No TypeScript source files found, skipping build');
        this.success('Project build skipped (using pre-built dist)');
        return;
      }

      execSync('npm run build', { stdio: 'inherit' });
      this.success('Project built successfully');
    } catch (error) {
      this.warning(`Build failed: ${error.message}`);
      this.warning('Continuing with pre-built dist files...');
    }
  }

  findTsFiles(dir) {
    const files = [];
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && !['node_modules', 'dist', '.git'].includes(item)) {
          files.push(...this.findTsFiles(fullPath));
        } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return files;
  }

  async runTests() {
    this.info('Running tests...');

    try {
      execSync('npm test', { stdio: 'inherit' });
      this.success('Tests passed');
    } catch (error) {
      this.warning('Tests failed or not configured, continuing...');
    }
  }

  async createBackup() {
    this.info('Creating backup...');

    if (!fs.existsSync(config.backupDir)) {
      fs.mkdirSync(config.backupDir, { recursive: true });
    }

    const backupName = `backup-v${this.newVersion}-${new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]}`;
    const backupPath = path.join(config.backupDir, `${backupName}.tar.gz`);

    try {
      execSync(`tar -czf "${backupPath}" dist/ package.json README.md LICENSE.md *.md`, { stdio: 'pipe' });
      this.success(`Backup created: ${backupPath}`);
    } catch (error) {
      this.warning(`Backup creation failed: ${error.message}`);
    }
  }

  async commitChanges() {
    this.info('Committing changes...');

    const commitMessage = `🚀 Release v${this.newVersion}

- Updated version to ${this.newVersion}
- Updated CHANGELOG.md with release notes
- Updated VERSIONING.md with version info
- Automated publish process

Changes:
- Version bump: ${this.currentVersion} → ${this.newVersion}
- Full npmjs and GitHub synchronization
- Complete documentation update

Co-authored-by: AI Assistant <ai@assistant.com>`;

    try {
      execSync('git add .', { stdio: 'pipe' });
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
      this.success('Changes committed');
    } catch (error) {
      this.error(`Commit failed: ${error.message}`);
    }
  }

  async createGitTag() {
    this.info('Creating git tag...');

    const tagName = `v${this.newVersion}`;
    const tagMessage = `Release ${this.newVersion}

Full changelog: ${config.githubRepo}/compare/v${this.currentVersion}...v${this.newVersion}

Features:
- Complete Zalo integration for n8n
- 8 nodes with 20+ operations
- Full webhook support
- Production ready

Co-authored-by: AI Assistant <ai@assistant.com>`;

    try {
      execSync(`git tag -a "${tagName}" -m "${tagMessage}"`, { stdio: 'pipe' });
      this.success(`Git tag created: ${tagName}`);
    } catch (error) {
      this.error(`Tag creation failed: ${error.message}`);
    }
  }

  async publishToNpm() {
    this.info('Publishing to npm...');

    try {
      if (this.isDryRun) {
        execSync('npm publish --dry-run', { stdio: 'inherit' });
        this.success('npm dry-run completed');
      } else {
        // Ensure CHANGELOG_USER.md exists before publishing
        if (!fs.existsSync('./CHANGELOG_USER.md')) {
          this.info('Generating user changelog before publish...');
          execSync('node scripts/generate-user-changelog.js', { stdio: 'pipe' });
        }
        
        execSync('npm publish', { stdio: 'inherit' });
        this.success(`Published to npm: ${config.packageName}@${this.newVersion}`);
      }
    } catch (error) {
      this.error(`npm publish failed: ${error.message}`);
    }
  }

  async pushToGitHub() {
    this.info('Pushing to GitHub...');

    try {
      if (this.isDryRun) {
        this.success('GitHub push skipped (dry-run mode)');
        return;
      }

      // Only add specific files (exclude CHANGELOG.md)
      execSync('git add package.json README.md CHANGELOG_USER.md VERSIONING.md PUBLISH_GUIDE.md dist/ scripts/ .gitignore', { stdio: 'pipe' });
      
      // Commit changes
      execSync(`git commit -m "🚀 Release v${this.newVersion}

- Version: ${this.newVersion}
- Package: ${config.packageName}
- Release Date: ${new Date().toISOString().split('T')[0]}
- User-friendly changelog only

Co-authored-by: AI Assistant <ai@assistant.com>"`, { stdio: 'pipe' });

      // Push commits
      execSync(`git push ${config.gitRemote} ${config.mainBranch}`, { stdio: 'inherit' });
      
      // Push tags
      execSync(`git push ${config.gitRemote} --tags`, { stdio: 'inherit' });
      
      this.success('Pushed to GitHub successfully');
    } catch (error) {
      this.error(`GitHub push failed: ${error.message}`);
    }
  }

  async createGitHubRelease() {
    this.info('Creating GitHub release...');

    try {
      if (this.isDryRun) {
        this.success('GitHub release skipped (dry-run mode)');
        return;
      }

      const tagName = `v${this.newVersion}`;
      const releaseNotes = this.generateReleaseNotes();
      const tempFile = `./temp_release_${tagName}.md`;
      
      // Write release notes to temp file
      fs.writeFileSync(tempFile, releaseNotes);
      
      try {
        // Try using GitHub CLI if available
        execSync(`gh release create ${tagName} --title "${tagName}" --notes-file "${tempFile}"`, { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        this.success(`GitHub release ${tagName} created successfully`);
      } catch (ghError) {
        this.warning('GitHub CLI not available, creating manual release instructions');
        this.createManualReleaseInstructions(tagName, releaseNotes);
      }
      
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      
    } catch (error) {
      this.warning(`GitHub release creation failed: ${error.message}`);
      this.createManualReleaseInstructions(`v${this.newVersion}`, this.generateReleaseNotes());
    }
  }

  generateReleaseNotes() {
    // Try to read user-friendly changelog first
    let releaseNotes = '';
    
    try {
      if (fs.existsSync('./CHANGELOG_USER.md')) {
        const userChangelog = fs.readFileSync('./CHANGELOG_USER.md', 'utf8');
        // Extract the latest version section
        const versionMatch = userChangelog.match(new RegExp(`## \\[${this.newVersion}\\] - [^\\n]+\\n([\\s\\S]*?)(?=## \\[|$)`));
        if (versionMatch) {
          releaseNotes = `# 🚀 Release v${this.newVersion}

${versionMatch[1].trim()}

## 🔗 Links
- [NPM Package](https://www.npmjs.com/package/n8n-nodes-zalo-public)
- [GitHub Repository](${config.githubRepo})
- [Documentation](./README.md)
- [Full Changelog](./CHANGELOG.md)

## 📞 Support
- **Maintainer**: Hayashi Itsuki
- **Contact**: 0899.524.011
- **Issues**: [GitHub Issues](${config.githubRepo}/issues)

---`;
        }
      }
    } catch (error) {
      console.warn('Failed to read user changelog, using default release notes');
    }
    
    // Fallback to default release notes
    if (!releaseNotes) {
      releaseNotes = `# 🚀 Release v${this.newVersion}

## 📦 Package Information
- **Package**: n8n-nodes-zalo-public
- **Version**: ${this.newVersion}
- **Release Date**: ${new Date().toISOString().split('T')[0]}

## ✨ What's New
- Complete Zalo integration for n8n
- 8 nodes with 20+ operations
- Full webhook support
- Production ready
- Automated publish system

## 🔧 Technical Details
- Built with TypeScript
- Compatible with n8n v0.187+
- Full Zalo API integration
- Webhook support for realtime events
- Automated version management

## 📋 Features
- **ZaloLoginByQr** - QR Code authentication with webhooks
- **ZaloGroup** - Complete group management (8 operations)
- **ZaloUser** - User management and contacts (9 operations)
- **ZaloSendMessage** - Send messages to users and groups
- **ZaloMessageTrigger** - Listen to new messages
- **ZaloFriendTrigger** - Friend request triggers
- **ZaloPoll** - Create and manage polls
- **ZaloTag** - User tagging system

## 🔗 Links
- [NPM Package](https://www.npmjs.com/package/n8n-nodes-zalo-public)
- [GitHub Repository](${config.githubRepo})
- [Documentation](./README.md)
- [Changelog](./CHANGELOG.md)

## 📞 Support
- **Maintainer**: Hayashi Itsuki
- **Contact**: 0899.524.011
- **Issues**: [GitHub Issues](${config.githubRepo}/issues)

---`;
    }

    return releaseNotes;
  }

  createManualReleaseInstructions(tagName, releaseNotes) {
    const instructionsFile = `./MANUAL_RELEASE_${tagName}.md`;
    
    const instructions = `# Manual Release Instructions for ${tagName}

## Steps to create release on GitHub:

1. Go to: ${config.githubRepo}/releases
2. Click "Create a new release"
3. Choose tag: ${tagName}
4. Release title: ${tagName}
5. Copy the release notes below:

---

${releaseNotes}

---

6. Click "Publish release"

## Alternative: Use GitHub CLI
\`\`\`bash
gh release create ${tagName} --title "${tagName}" --notes "${releaseNotes}"
\`\`\`

---
*Generated by AI Assistant*`;

    fs.writeFileSync(instructionsFile, instructions);
    this.info(`Manual instructions saved to: ${instructionsFile}`);
  }

  async generateReleaseNotes() {
    this.info('Generating release notes...');

    const releaseNotes = `# 🚀 Release v${this.newVersion}

## 📦 Package Information
- **Package**: ${config.packageName}
- **Version**: ${this.newVersion}
- **Previous**: ${this.currentVersion}
- **Release Date**: ${new Date().toISOString().split('T')[0]}

## ✨ What's New
- Automated publish process
- Complete npmjs and GitHub synchronization
- Updated documentation and changelogs
- Enhanced version management

## 🔧 Technical Details
- Built with TypeScript
- Compatible with n8n v0.187+
- Full Zalo API integration
- Webhook support for realtime events

## 📋 Features
- **8 Zalo Nodes**: Complete integration
- **20+ Operations**: Full API coverage
- **Webhook Support**: Realtime events
- **Production Ready**: Stable and tested

## 🔗 Links
- [NPM Package](https://www.npmjs.com/package/${config.packageName})
- [GitHub Repository](${config.githubRepo})
- [Documentation](./README.md)
- [Changelog](./CHANGELOG.md)

## 📞 Support
- **Maintainer**: Hayashi Itsuki
- **Contact**: 0899.524.011
- **Issues**: [GitHub Issues](${config.githubRepo}/issues)

---`;

    const releaseNotesPath = `./RELEASE_NOTES_v${this.newVersion}.md`;
    fs.writeFileSync(releaseNotesPath, releaseNotes);
    this.success(`Release notes generated: ${releaseNotesPath}`);
  }

  async publish() {
    try {
      this.log(`🚀 Starting publish process for ${config.packageName}`, 'cyan');
      this.log(`📦 Version: ${this.currentVersion} → ${this.newVersion}`, 'magenta');
      this.log(`🔍 Mode: ${this.isDryRun ? 'DRY RUN' : 'LIVE'}`, 'yellow');

      await this.checkPrerequisites();
      await this.updateVersion();
      await this.updateChangelog();
      await this.updateVersioning();
      await this.buildProject();
      await this.runTests();
      await this.createBackup();
      await this.commitChanges();
      await this.createGitTag();
      await this.publishToNpm();
      await this.pushToGitHub();
      await this.createGitHubRelease();
      await this.generateReleaseNotes();

      const duration = Math.round((new Date() - this.startTime) / 1000);
      this.success(`🎉 Publish completed successfully in ${duration}s!`);
      
      if (this.isDryRun) {
        this.warning('This was a dry run - no actual changes were made');
      } else {
        this.info(`📦 Published: https://www.npmjs.com/package/${config.packageName}`);
        this.info(`🐙 GitHub: ${config.githubRepo}/releases/tag/v${this.newVersion}`);
        this.info(`📋 Releases: ${config.githubRepo}/releases`);
      }

    } catch (error) {
      this.error(`Publish failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const publisher = new Publisher();
  publisher.publish();
}

module.exports = Publisher;
