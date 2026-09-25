import fs from 'fs';
import path from 'path';
import handler_verify from '../api/verifyOTP.js';
import handler_reset from '../api/resetPassword.js';

async function loadEnv() {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key) process.env[key.trim()] = val.join('=').trim();
    });
    if (process.env.FIREBASE_PRIVATE_KEY) {
        process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\n/g, '\n');
    }
}

async function run() {
    await loadEnv();
    console.log('🚀 Starting Concurrent Password Reset Validation...');

    const { initFirebaseAdmin } = await import('../api/_utils/firebase.js');
    const { auth, db } = initFirebaseAdmin();
    
    const testEmail = 'runtime-test-A@example.com';
    const otpCode = '123456';

    // 1. Create a real user in the test project to avoid "user not found"
    let uid;
    try {
        const user = await auth.createUser({
            email: testEmail,
            password: 'InitialPassword123!',
        });
        uid = user.uid;
        console.log(`Created test user: ${uid}`);
    } catch (e) {
        if (e.code === 'auth/email-already-exists') {
            const user = await auth.getUserByEmail(testEmail);
            uid = user.uid;
            console.log(`Using existing test user: ${uid}`);
        } else {
            throw e;
        }
    }

    const token = 'test-token-' + Math.random().toString(36).substr(2, 9);

    // 2. Create the OTP record precisely
    await db.ref(`otp-requests/${token}`).set({
        uid: uid,
        email: testEmail.toLowerCase().trim(),
        code: otpCode,
        status: 'ACTIVE',
        attempts: 0,
        expiresAt: Date.now() + 900000
    });

    console.log(`Generated test transaction: ${token}`);

    const createMockRes = () => ({
        statusCode: 0,
        body: null,
        headers: {},
        setHeader: function(name, val) { this.headers[name] = val; return this; },
        status: function(c) { this.statusCode = c; return this; },
        json: function(d) { this.body = d; return this; },
        send: function(d) { this.body = d; return this; },
    });

    // 3. Verify the OTP
    const resVerify = createMockRes();
    await handler_verify({ method: 'POST', body: { transactionToken: token, code: otpCode }, query: {} }, resVerify);
    console.log(`Verification result: ${resVerify.statusCode}`);

    // 4. Concurrent Reset Requests
    const resetReq = {
        method: 'POST',
        body: { transactionToken: token, email: testEmail.toLowerCase().trim(), newPassword: 'NewPassword123!' },
        query: {}
    };

    const executeReset = async (id) => {
        const res = createMockRes();
        await handler_reset(resetReq, res);
        return { id, status: res.statusCode, body: res.body };
    };

    console.log('Issuing 3 concurrent reset requests...');
    const results = await Promise.all([
        executeReset(1),
        executeReset(2),
        executeReset(3)
    ]);

    results.forEach(r => console.log(`Request ${r.id}: Status ${r.status}`));

    const successCount = results.filter(r => r.status === 200).length;
    console.log(`\nTotal Successes: ${successCount}`);
    
    if (successCount === 1) {
        console.log('✅ PASS: Only one reset authorization succeeded.');
    } else if (successCount > 1) {
        console.log('❌ FAIL: Multiple resets authorized!');
    } else {
        console.log('❌ FAIL: No resets authorized.');
    }
}

run().catch(console.error);
