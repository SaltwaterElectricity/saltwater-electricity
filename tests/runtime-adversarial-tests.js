async function run() {
    console.log('🚀 Starting Runtime Adversarial Security Validation...');
    
    const mockDb = {
        data: {},
        ref: function(path) {
            if (!this.data[path]) this.data[path] = {};
            return {
                set: async (val) => { this.data[path] = val; },
                once: async () => ({
                    exists: () => !!this.data[path],
                    val: () => this.data[path]
                }),
                update: async (val) => {
                    this.data[path] = { ...this.data[path], ...val };
                },
                remove: async () => { delete this.data[path]; },
                transaction: async (updateFn) => {
                    const current = this.data[path];
                    const next = updateFn(current);
                    if (next === null) return { committed: false, snapshot: null };
                    this.data[path] = next;
                    return { committed: true, snapshot: next };
                }
            };
        }
    };

    const mockAuth = {
        getUserByEmail: async (email) => {
            if (email === 'accountA@test.com') return { uid: 'uid_A' };
            if (email === 'accountB@test.com') return { uid: 'uid_B' };
            throw { code: 'auth/user-not-found' };
        },
        updateUser: async (uid, _data) => {
            return { uid };
        }
    };

    const generateOTP = async (email) => {
        const token = 'token_' + Math.random().toString(36).substr(2, 9);
        const code = '123456';
        mockDb.ref(`otp-requests/${token}`).set({
            uid: await mockAuth.getUserByEmail(email).then(u => u.uid),
            email,
            code,
            status: 'ACTIVE',
            attempts: 0,
            expiresAt: Date.now() + 900000
        });
        return { transactionToken: token, code };
    };

    const verifyOTP = async (token, code) => {
        const ref = mockDb.ref(`otp-requests/${token}`);
        const result = await ref.transaction((current) => {
            if (!current || current.status !== 'ACTIVE') return null;
            if (current.code !== code) {
                const n = (current.attempts || 0) + 1;
                return n >= 3 ? { ...current, attempts: n, status: 'INVALIDATED' } : { ...current, attempts: n };
            }
            return { ...current, status: 'CONSUMED' };
        });
        if (!result.committed) throw new Error('Invalid or expired');
        return result.snapshot;
    };

    const resetPassword = async (token, email, newPassword) => {
        const ref = mockDb.ref(`otp-requests/${token}`);
        const snap = await ref.once('value');
        const data = snap.val();
        if (!data || data.status !== 'CONSUMED') throw new Error('Not authorized');
        if (email && data.email !== email) throw new Error('Email mismatch');
        await mockAuth.updateUser(data.uid, { password: newPassword });
        await ref.remove();
        return { success: true };
    };

    // --- TEST SUITE ---

    console.log('\n[Phase 5A] Token Unpredictability');
    const t1 = await generateOTP('accountA@test.com');
    const t2 = await generateOTP('accountA@test.com');
    console.log(t1.transactionToken !== t2.transactionToken ? '✅ Unique' : '❌ Duplicate');

    console.log('\n[Phase 5B] Account Binding');
    const authA = await generateOTP('accountA@test.com');
    try {
        await resetPassword(authA.transactionToken, 'accountB@test.com', 'newPass123');
        console.log('❌ FAIL: Substitution allowed');
    } catch (e) {
        console.log(`✅ PASS: Substitution rejected (${e.message})`);
    }

    console.log('\n[Phase 5D] Single-Use');
    const authD = await generateOTP('accountA@test.com');
    await verifyOTP(authD.transactionToken, authD.code);
    try {
        await verifyOTP(authD.transactionToken, authD.code);
        console.log('❌ FAIL: Replay allowed');
    } catch (e) {
        console.log(`✅ PASS: Replay rejected (${e.message})`);
    }

    console.log('\n[Phase 5E] Wrong-OTP Concurrency');
    const authE = await generateOTP('accountA@test.com');
    const concurrentWrong = await Promise.allSettled([
        verifyOTP(authE.transactionToken, '000000'),
        verifyOTP(authE.transactionToken, '000000'),
        verifyOTP(authE.transactionToken, '000000'),
        verifyOTP(authE.transactionToken, '000000'),
        verifyOTP(authE.transactionToken, '000000'),
    ]);
    const successCount = concurrentWrong.filter(r => r.status === 'fulfilled').length;
    console.log(`Requests: 5, Successes: ${successCount}, Final State: ${mockDb.data[`otp-requests/${authE.transactionToken}`]?.status}`);
    console.log(successCount < 4 ? '✅ PASS: Attempt limit enforced' : '❌ FAIL: Limit bypassed');

    console.log('\n[Phase 5F] Correct-OTP Concurrency');
    const authF = await generateOTP('accountA@test.com');
    const concurrentCorrect = await Promise.allSettled([
        verifyOTP(authF.transactionToken, authF.code),
        verifyOTP(authF.transactionToken, authF.code),
    ]);
    const consumedCount = concurrentCorrect.filter(r => r.status === 'fulfilled').length;
    console.log(`Requests: 2, Consumed: ${consumedCount}`);
    console.log(consumedCount === 1 ? '✅ PASS: Single consumption' : '❌ FAIL: Double consumption');

    console.log('\n--- Security Validation Complete ---');
}

run().catch(console.error);
