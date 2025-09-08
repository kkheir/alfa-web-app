// Debug script for testing alfaHelper locally
// Run with: node debug-alfa.js

const { alfaHelper } = require('../app/api/alfa/Helpers/alfaHelper.ts');

async function debugAlfaHelper() {
    console.log('🚀 Starting Alfa Helper Debug Session');
    console.log('='.repeat(50));

    // Test credentials - replace with real ones
    const testUser = 'test_user';
    const testPassword = 'test_password';

    try {
        console.log('1️⃣ Creating alfaHelper instance...');
        const helper = new alfaHelper({ user: testUser, password: testPassword }, 1);
        console.log('✅ Instance created');

        console.log('\n2️⃣ Testing login step...');
        const loginResult = await helper.login();
        console.log('Login result:', loginResult);
        console.log('Verification token:', helper.requestVerificationToken ? 'Present' : 'Missing');

        if (loginResult) {
            console.log('\n3️⃣ Testing credential submission...');
            const submitResult = await helper.submitCredentials();
            console.log('Submit result:', submitResult);

            if (submitResult) {
                console.log('\n4️⃣ Testing panel retrieval...');
                const panels = await helper.getAllPanels();
                console.log('Panels result:', panels);
                console.log('Number of panels:', Array.isArray(panels) ? panels.length : 'Not an array');
            }
        }

    } catch (error) {
        console.error('💥 Error during debug session:', error);
        console.error('Stack trace:', error.stack);
    }

    console.log('\n🏁 Debug session completed');
}

// Run the debug session
debugAlfaHelper();
