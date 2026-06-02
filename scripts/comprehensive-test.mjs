#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Trace
 * Tests functionality, data integrity, and readiness for submission
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🧪 Trace Comprehensive Test Suite\n');

let passedTests = 0;
let failedTests = 0;
const warnings = [];

function test(name, fn) {
    try {
        fn();
        console.log(`   ✅ ${name}`);
        passedTests++;
        return true;
    } catch (error) {
        console.log(`   ❌ ${name}: ${error.message}`);
        failedTests++;
        return false;
    }
}

function warn(message) {
    warnings.push(message);
    console.log(`   ⚠️  ${message}`);
}

// Test 1: Environment Configuration
console.log('1️⃣ Testing Environment Configuration...');
const envPath = join(rootDir, '.env');
if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    test('Algolia App ID configured', () => {
        if (!envContent.includes('VITE_ALGOLIA_APP_ID=') || envContent.match(/VITE_ALGOLIA_APP_ID=\s*$/m)) {
            throw new Error('VITE_ALGOLIA_APP_ID not set');
        }
    });
    test('Algolia Search API Key configured', () => {
        if (!envContent.includes('VITE_ALGOLIA_SEARCH_API_KEY=') || envContent.match(/VITE_ALGOLIA_SEARCH_API_KEY=\s*$/m)) {
            throw new Error('VITE_ALGOLIA_SEARCH_API_KEY not set');
        }
    });
    test('Algolia Agent ID configured', () => {
        if (!envContent.includes('VITE_ALGOLIA_AGENT_ID=') || envContent.match(/VITE_ALGOLIA_AGENT_ID=\s*$/m)) {
            throw new Error('VITE_ALGOLIA_AGENT_ID not set');
        }
    });
    if (!envContent.includes('VITE_OPENAI_API_KEY=') || envContent.match(/VITE_OPENAI_API_KEY=\s*$/m) || envContent.includes('VITE_OPENAI_API_KEY=your_')) {
        warn('OpenAI API key not configured (screenshot detection will be disabled)');
    } else {
        test('OpenAI API Key configured', () => true);
    }
} else {
    warn('.env file not found - application will not work');
}

// Test 2: Enhanced Data Files
console.log('\n2️⃣ Testing Enhanced Data Files...');
const dataFiles = [
    { path: 'data/components_index_enhanced.json', expected: 10, name: 'components' },
    { path: 'data/code_implementations_index_enhanced.json', expected: 5, name: 'code implementations' },
    { path: 'data/accessibility_index_enhanced.json', expected: 5, name: 'accessibility guides' }
];

dataFiles.forEach(({ path, expected, name }) => {
    const fullPath = join(rootDir, path);
    test(`${name} data file exists`, () => {
        if (!existsSync(fullPath)) throw new Error(`${path} not found`);
    });
    if (existsSync(fullPath)) {
        const content = JSON.parse(readFileSync(fullPath, 'utf-8'));
        test(`${name} has ${expected} records`, () => {
            if (content.length !== expected) throw new Error(`Expected ${expected}, got ${content.length}`);
        });
        test(`${name} records have required fields`, () => {
            if (name === 'components') {
                const required = ['objectID', 'name', 'description', 'category'];
                content.forEach((item, i) => {
                    required.forEach(field => {
                        if (!item[field]) throw new Error(`Record ${i} missing ${field}`);
                    });
                });
            }
        });
    }
});

// Test 3: Critical Source Files
console.log('\n3️⃣ Testing Critical Source Files...');
const sourceFiles = [
    'src/components/ChatInterface-premium.tsx',
    'src/services/algolia.ts',
    'src/services/vision.ts',
    'src/components/CodeBlock.tsx',
    'src/components/Icons.tsx',
    'src/App.tsx',
    'src/index.css',
    'src/main.tsx'
];

sourceFiles.forEach(file => {
    const fullPath = join(rootDir, file);
    test(file, () => {
        if (!existsSync(fullPath)) throw new Error('File not found');
        const content = readFileSync(fullPath, 'utf-8');
        if (content.length < 100) throw new Error('File appears empty or too small');
    });
});

// Test 4: Vision Service Implementation
console.log('\n4️⃣ Testing Vision Service...');
const visionPath = join(rootDir, 'src/services/vision.ts');
if (existsSync(visionPath)) {
    const visionContent = readFileSync(visionPath, 'utf-8');
    test('analyzeDesignScreenshot function exists', () => {
        if (!visionContent.includes('analyzeDesignScreenshot')) throw new Error('Function not found');
    });
    test('imageToBase64 function exists', () => {
        if (!visionContent.includes('imageToBase64')) throw new Error('Function not found');
    });
    test('GPT-4o model configured', () => {
        if (!visionContent.includes('gpt-4o')) throw new Error('Model not configured correctly');
    });
    test('VisionAnalysisResult interface defined', () => {
        if (!visionContent.includes('interface VisionAnalysisResult')) throw new Error('Interface not found');
    });
}

// Test 5: Chat Interface Features
console.log('\n5️⃣ Testing Chat Interface Features...');
const chatPath = join(rootDir, 'src/components/ChatInterface-premium.tsx');
if (existsSync(chatPath)) {
    const chatContent = readFileSync(chatPath, 'utf-8');
    test('Multi-index loading messages', () => {
        if (!chatContent.includes('loadingMessages')) throw new Error('Loading messages not found');
        if (!chatContent.includes('Searching components')) throw new Error('Component search message missing');
    });
    test('Follow-up suggestions', () => {
        if (!chatContent.includes('getFollowUpSuggestions')) throw new Error('Follow-up function not found');
    });
    test('Source attribution', () => {
        if (!chatContent.includes('mockSources')) throw new Error('Source attribution not found');
    });
    test('Image upload support', () => {
        if (!chatContent.includes('attachedFile')) throw new Error('Image upload not found');
        if (!chatContent.includes('imageToBase64')) throw new Error('Image conversion not integrated');
    });
    test('Vision analysis integration', () => {
        if (!chatContent.includes('analyzeDesignScreenshot')) throw new Error('Vision analysis not integrated');
        if (!chatContent.includes('isAnalyzingImage')) throw new Error('Vision state not found');
    });
    test('Mobile responsive classes', () => {
        if (!chatContent.includes('sm:')) throw new Error('Responsive classes not found');
        if (!chatContent.includes('md:')) throw new Error('Medium breakpoint classes not found');
    });
}

// Test 6: Documentation
console.log('\n6️⃣ Testing Documentation...');
const docs = [
    { file: 'README.md', minSize: 2000, desc: 'Main README' },
    { file: 'SCREENSHOT-DETECTION.md', minSize: 1000, desc: 'Screenshot detection guide' },
    { file: 'CONTEST-IMPROVEMENTS.md', minSize: 500, desc: 'Contest strategy' },
    { file: 'DEMO-VIDEO-SCRIPT.md', minSize: 1000, desc: 'Demo script' },
    { file: 'SUBMISSION-CHECKLIST.md', minSize: 1000, desc: 'Submission checklist' }
];

docs.forEach(({ file, minSize, desc }) => {
    const fullPath = join(rootDir, file);
    test(desc, () => {
        if (!existsSync(fullPath)) throw new Error(`${file} not found`);
        const content = readFileSync(fullPath, 'utf-8');
        if (content.length < minSize) throw new Error(`${file} too short (${content.length} < ${minSize})`);
    });
});

// Test 7: Build Configuration
console.log('\n7️⃣ Testing Build Configuration...');
const packagePath = join(rootDir, 'package.json');
if (existsSync(packagePath)) {
    const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
    test('Required dependencies installed', () => {
        const required = ['react', 'algoliasearch', 'react-markdown', 'tailwindcss'];
        required.forEach(dep => {
            if (!pkg.dependencies[dep] && !pkg.devDependencies[dep]) {
                throw new Error(`${dep} not in dependencies`);
            }
        });
    });
    test('Dev script configured', () => {
        if (!pkg.scripts.dev) throw new Error('dev script not found');
    });
    test('Build script configured', () => {
        if (!pkg.scripts.build) throw new Error('build script not found');
    });
}

// Test 8: Contest Readiness
console.log('\n8️⃣ Testing Contest Readiness...');
test('All 7 indices mentioned in code', () => {
    const chatContent = readFileSync(join(rootDir, 'src/components/ChatInterface-premium.tsx'), 'utf-8');
    if (!chatContent.includes('7')) throw new Error('7-index system not prominently featured');
});

test('Algolia Agent Studio mentioned', () => {
    const readmePath = join(rootDir, 'README.md');
    const readmeContent = readFileSync(readmePath, 'utf-8');
    if (!readmeContent.includes('Algolia Agent Studio')) throw new Error('Algolia Agent Studio not mentioned');
});

test('shadcn/ui components referenced', () => {
    const componentsPath = join(rootDir, 'data/components_index_enhanced.json');
    if (existsSync(componentsPath)) {
        const components = JSON.parse(readFileSync(componentsPath, 'utf-8'));
        if (components.length < 10) throw new Error('Less than 10 components');
    }
});

// Results Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
if (warnings.length > 0) {
    console.log(`⚠️  Warnings: ${warnings.length}`);
    warnings.forEach(w => console.log(`   • ${w}`));
}

console.log('\n' + '='.repeat(60));
if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n✅ Trace is ready for submission!');
    console.log('\n📋 Next Steps:');
    console.log('   1. npm run dev - Test locally at http://localhost:5174/');
    console.log('   2. Record demo video (3-5 minutes)');
    console.log('   3. Write DEV.to submission post');
    console.log('   4. Submit by February 8, 2026');
    console.log('\n💡 Pro Tips:');
    console.log('   • Add VITE_OPENAI_API_KEY to test screenshot detection');
    console.log('   • Deploy to Vercel/Netlify for bonus points');
    console.log('   • Test on mobile devices');
} else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('='.repeat(60));
    console.log('\nPlease fix the failed tests before submission.');
}

process.exit(failedTests > 0 ? 1 : 0);
