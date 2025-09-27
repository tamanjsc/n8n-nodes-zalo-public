const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting code obfuscation for n8n-nodes-zalo-public...');

const sourceDir = path.join(__dirname, '../dist');
const outputDir = path.join(__dirname, '../dist-obfuscated');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`📁 Source: ${sourceDir}`);
console.log(`📁 Output: ${outputDir}`);

// Obfuscation options - Safe configuration for n8n
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: false, // Disable to prevent n8n issues
    controlFlowFlatteningThreshold: 0.5,
    numbersToExpressions: false, // Disable to prevent n8n issues
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    stringArray: true,
    stringArrayThreshold: 0.8,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: false, // Disable to prevent n8n issues
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'function',
    stringArrayIndexesType: ['hexadecimal-number'],
    transformObjectKeys: false, // Disable to prevent n8n issues
    unicodeEscapeSequence: false,
    deadCodeInjection: false, // Disable to prevent n8n issues
    deadCodeInjectionThreshold: 0.5,
    debugProtection: false, // Disable to prevent n8n issues
    debugProtectionInterval: 2000,
    disableConsoleOutput: false, // Keep console for debugging
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    renameGlobals: false,
    selfDefending: false, // Disable to prevent n8n issues
    target: 'node',
    rotateStringArray: true,
    shuffleStringArray: true,
    stringArrayCallsTransform: false // Disable to prevent n8n issues
};

// Function to recursively process files
function processDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Create directory in output
            const outputSubDir = path.join(outputDir, relativeItemPath);
            if (!fs.existsSync(outputSubDir)) {
                fs.mkdirSync(outputSubDir, { recursive: true });
            }
            processDirectory(fullPath, relativeItemPath);
        } else if (item.endsWith('.js') && !item.endsWith('.js.map')) {
            // Obfuscate JavaScript files
            try {
                console.log(`🔒 Obfuscating: ${fullPath}`);
                
                const sourceCode = fs.readFileSync(fullPath, 'utf8');
                const obfuscatedCode = JavaScriptObfuscator.obfuscate(sourceCode, obfuscationOptions);
                
                const outputPath = path.join(outputDir, relativeItemPath);
                fs.writeFileSync(outputPath, obfuscatedCode.getObfuscatedCode());
                
                console.log(`✅ Obfuscated: ${outputPath}`);
            } catch (error) {
                console.error(`❌ Error obfuscating ${fullPath}:`, error.message);
                // Copy original file if obfuscation fails
                const outputPath = path.join(outputDir, relativeItemPath);
                fs.copyFileSync(fullPath, outputPath);
            }
        } else if (item.endsWith('.d.ts')) {
            // Skip TypeScript declaration files - not needed for n8n
            console.log(`⏭️ Skipping .d.ts file: ${fullPath}`);
        } else {
            // Copy other files as-is
            const outputPath = path.join(outputDir, relativeItemPath);
            fs.copyFileSync(fullPath, outputPath);
        }
    }
}

// Process the source directory
processDirectory(sourceDir);

console.log('✅ Code obfuscation completed!');
console.log(`📦 Obfuscated files are in: ${outputDir}/`);
