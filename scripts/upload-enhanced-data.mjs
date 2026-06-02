import algoliasearch from 'algoliasearch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const appId = process.env.VITE_ALGOLIA_APP_ID;
const apiKey = process.env.VITE_ALGOLIA_WRITE_API_KEY;

if (!appId || !apiKey) {
    console.error('❌ Missing Algolia credentials. Please check your .env file.');
    process.exit(1);
}

const client = algoliasearch(appId, apiKey);

// Configuration for enhanced data
const enhancedIndicesConfig = [
    {
        indexName: 'components_index',
        dataFile: 'components_index_enhanced.json',
        settings: {
            searchableAttributes: [
                'name',
                'displayName',
                'description',
                'keywords',
                'tags',
                'useCases',
                'category'
            ],
            attributesForFaceting: [
                'category',
                'status',
                'tags',
                'variants'
            ],
            customRanking: ['desc(version)']
        }
    },
    {
        indexName: 'code_implementations_index',
        dataFile: 'code_implementations_index_enhanced.json',
        settings: {
            searchableAttributes: [
                'componentName',
                'code',
                'exampleUsage',
                'filename',
                'category'
            ],
            attributesForFaceting: [
                'language',
                'framework',
                'category',
                'complexity'
            ],
            customRanking: ['desc(lastUpdated)']
        }
    },
    {
        indexName: 'accessibility_index',
        dataFile: 'accessibility_index_enhanced.json',
        settings: {
            searchableAttributes: [
                'componentName',
                'guidelines',
                'ariaAttributes.attribute',
                'ariaAttributes.usage',
                'keyboardSupport.key',
                'commonMistakes',
                'codeExample'
            ],
            attributesForFaceting: [
                'wcagLevel',
                'componentId'
            ]
        }
    }
];

async function uploadEnhancedData() {
    console.log('🚀 Starting enhanced data upload to Algolia...\n');

    for (const config of enhancedIndicesConfig) {
        try {
            console.log(`📦 Processing ${config.indexName}...`);
            
            // Read data file
            const dataPath = path.resolve(__dirname, '../data', config.dataFile);
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            
            console.log(`   Found ${data.length} records`);
            
            // Get index
            const index = client.initIndex(config.indexName);
            
            // Upload objects
            const { objectIDs } = await index.saveObjects(data);
            console.log(`   ✅ Uploaded ${objectIDs.length} objects`);
            
            // Configure index settings
            await index.setSettings(config.settings);
            console.log(`   ⚙️  Configured search settings`);
            
            console.log(`   ✨ ${config.indexName} complete!\n`);
            
        } catch (error) {
            console.error(`   ❌ Error processing ${config.indexName}:`, error.message);
        }
    }
    
    console.log('🎉 Enhanced data upload complete!');
    console.log('\n📊 Summary:');
    console.log('   • 10 real shadcn/ui components');
    console.log('   • 5 complete code implementations');
    console.log('   • 5 comprehensive accessibility guides');
    console.log('\n✅ Your Trace now has production-quality data!');
}

uploadEnhancedData().catch(console.error);
