import fs from 'fs';
import path from 'path';
import { initFirebaseAdmin } from '../api/_utils/firebase.js';

async function loadEnv() {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key) process.env[key.trim()] = val.join('=').trim();
    });
}

async function inspect() {
    await loadEnv();
    // Fix the private key newlines
    if (process.env.FIREBASE_PRIVATE_KEY) {
        process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\n/g, '\n');
    }

    const { db } = initFirebaseAdmin();
    const email = 'test.user@example.com';
    
    const crypto = await import('crypto');
    const token = crypto.randomUUID();
    const otpCode = '123456';
    
    await db.ref(`otp-requests/${token}`).set({
        uid: 'test-uid-123',
        email: email,
        code: otpCode,
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + 900000,
        attempts: 0,
        status: 'ACTIVE'
    });
    
    console.log(`Generated Test Record at: otp-requests/${token}`);
    const snapshot = await db.ref(`otp-requests/${token}`).once('value');
    console.log('Record Data:', JSON.stringify(snapshot.val(), null, 2));
    
    await db.ref(`otp-requests/${token}`).remove();
}

inspect().catch(console.error);
