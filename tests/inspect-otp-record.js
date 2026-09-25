import { initFirebaseAdmin } from '../api/_utils/firebase.js';

async function inspect() {
    const { db } = initFirebaseAdmin();
    const email = 'test.user@example.com';
    
    // We need to generate an OTP first to get a token
    // Since we can't easily call the handler, we'll simulate the generation logic
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
    
    // Clean up
    await db.ref(`otp-requests/${token}`).remove();
}

inspect().catch(console.error);
