#!/usr/bin/env node

/**
 * 📝 Generate User-Friendly Changelog
 * 
 * Tạo changelog thân thiện với user từ changelog chi tiết
 * 
 * Usage:
 *   node scripts/generate-user-changelog.js
 */

const fs = require('fs');
const path = require('path');

console.log('📝 Generating user-friendly changelog...');

const adminChangelogPath = './CHANGELOG.md';
const userChangelogPath = './CHANGELOG_USER.md';

// Read admin changelog
if (!fs.existsSync(adminChangelogPath)) {
    console.error('❌ CHANGELOG.md not found!');
    process.exit(1);
}

const adminChangelog = fs.readFileSync(adminChangelogPath, 'utf8');

// Parse changelog and extract user-friendly content
function generateUserChangelog(adminContent) {
    const lines = adminContent.split('\n');
    const userLines = [];
    let inVersion = false;
    let currentVersion = '';
    let versionDate = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Version header
        if (line.match(/^## \[([^\]]+)\]/)) {
            const match = line.match(/^## \[([^\]]+)\] - (.+)$/);
            if (match) {
                currentVersion = match[1];
                versionDate = match[2];
                inVersion = true;
                
                userLines.push(`## [${currentVersion}] - ${versionDate}`);
                userLines.push('');
                
                // Add version-specific content
                if (currentVersion === '0.0.3') {
                    userLines.push('### 🎉 What\'s New');
                    userLines.push('- **Complete Zalo Integration** - 8 powerful nodes for n8n');
                    userLines.push('- **Professional Package** - Optimized for production use');
                    userLines.push('- **Easy Installation** - Simple npm install command');
                    userLines.push('');
                    userLines.push('### ✨ Key Features');
                    userLines.push('- **ZaloLoginByQr** - QR Code authentication with webhooks');
                    userLines.push('- **ZaloSendMessage** - Send messages to users and groups');
                    userLines.push('- **ZaloUser** - Manage users and friends');
                    userLines.push('- **ZaloGroup** - Complete group management');
                    userLines.push('- **ZaloMessageTrigger** - Listen to new messages');
                    userLines.push('- **ZaloFriendTrigger** - Friend request triggers');
                    userLines.push('- **ZaloPoll** - Create and manage polls');
                    userLines.push('- **ZaloTag** - User tagging system');
                    userLines.push('');
                    userLines.push('### 🔧 Improvements');
                    userLines.push('- **Package Size** - Optimized to 81.1kB');
                    userLines.push('- **Performance** - Fast and reliable');
                    userLines.push('- **Documentation** - Complete guides and examples');
                    userLines.push('');
                } else if (currentVersion === '0.0.2') {
                    userLines.push('### 🔧 Improvements');
                    userLines.push('- Initial package optimization');
                    userLines.push('- Reduced package size');
                    userLines.push('');
                } else if (currentVersion === '0.0.1') {
                    userLines.push('### 🎉 Initial Release');
                    userLines.push('- Complete Zalo integration');
                    userLines.push('- 8 powerful nodes');
                    userLines.push('- Professional documentation');
                    userLines.push('');
                }
                
                continue;
            }
        }
        
        // Skip detailed technical content
        if (inVersion) {
            if (line.startsWith('### Added') || 
                line.startsWith('### Changed') || 
                line.startsWith('### Fixed') ||
                line.startsWith('### Technical Details') ||
                line.startsWith('### 📝 Technical Details')) {
                // Skip these sections for user changelog
                continue;
            }
            
            if (line.startsWith('## [') && !line.includes(currentVersion)) {
                // Next version, stop processing
                break;
            }
        }
    }
    
    return userLines.join('\n');
}

// Generate user changelog content
const userChangelogContent = `# 📝 CHANGELOG - n8n-nodes-zalo-public

> **User-friendly changelog** - Chỉ hiển thị những thay đổi quan trọng cho người dùng

## [Unreleased]

${generateUserChangelog(adminChangelog)}

---

## Previous Versions

### [0.0.2] - 2025-09-27
- Initial package optimization
- Reduced package size

### [0.0.1] - 2025-09-27
- Initial release
- Complete Zalo integration

---

**📞 Need Help?**
- [GitHub Issues](https://github.com/aiviethub/n8n-nodes-zalo-public/issues)
- [Documentation](./README.md)
- [Support Guide](./PUBLISH_GUIDE.md)
`;

// Write user changelog
fs.writeFileSync(userChangelogPath, userChangelogContent);

console.log('✅ User-friendly changelog generated successfully!');
console.log(`📁 File: ${userChangelogPath}`);
