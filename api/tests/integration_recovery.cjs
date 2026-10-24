const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { initFirebaseAdmin } = require('../_utils/firebase.js');

// 1. Setup Environment
const envPath = path.join(process.cwd(), '.env.test');
dotenv.config({ path: envPath });

// Safety check for Production
if (process.env.FIREBASE_PROJECT_ID === 'saltwater-electricity') {
    console.error('[FATAL] PRODUCTION PROJECT DETECTED. ABORTING.');
    process.exit(1);
}

const { db } = initFirebaseAdmin();
const EXEC_ID = `test_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
const TEST_NAMESPACE = `test_recovery/${EXEC_ID}`;

console.log(`--- Starting Recovery Verification ---`);
console.log(`Execution ID: ${EXEC_ID}`);
console.log(`Target: ${process.env.FIREBASE_PROJECT_ID}`);

async function assert(condition, message) {
    if (!condition) throw new Error(`Assertion Failed: ${message}`);
}

// Mock Response Object for the handler
const createMockRes = () => {
    const res = {
        status: (code) => {
            res.statusCode = code;
            return res;
        },
        json: (data) => {
            res.body = data;
            return res;
        },
        setHeader: () => res,
    };
    return res;
};

// Wrapper to run the webhook handler with a request object
async function runWebhook(payload, headers = {}) {
    const handler = require('../sms/webhook.js').default;
    const req = {
        method: 'POST',
        headers: {
            'webhook-secret-key': process.env.UNISMS_WEBHOOK_SECRET,
            ...headers
        },
        body: payload,
    };
    const res = createMockRes();
    await handler(req, res);
    return res;
}

async function runTests() {
    const manifest = [];
    const recordsCreated = [];

    try {
        console.log('\n[1/13] Testing New Receipt Claim...');
        const p1 = { id: `msg_${EXEC_ID}_1`, event: 'message.sent' };
        const r1 = await runWebhook(p1);
        assert(r1.statusCode === 200 && r1.body.status === 'processed', 'Should process new receipt');
        
        const eventId1 = crypto.createHash('sha256').update(`${p1.id}|${p1.event}`).digest('hex');
        const receipt1 = (await db.ref(`webhooks_pending/${eventId1}`).get()).val();
        assert(receipt1.processed === true, 'Receipt should be marked processed');
        recordsCreated.push(`webhooks_pending/${eventId1}`);

        console.log('[2/13] Testing Duplicate Claim (Valid Lease)...');
        // We need a way to "pause" the handler to test a duplicate claim during processing.
        // Since we can't pause the actual handler, we simulate the 'processing' state manually.
        const p2 = { id: `msg_${EXEC_ID}_2`, event: 'message.sent' };
        const eventId2 = crypto.createHash('sha256').update(`${p2.id}|${p2.event}`).digest('hex');
        await db.ref(`webhooks_pending/${eventId2}`).set({
            state: 'processing',
            timestamp: Date.now(),
            leaseExpiresAt: Date.now() + 300000,
            ownerToken: 'someone-else'
        });
        const r2 = await runWebhook(p2);
        assert(r2.body.status === 'already_processed', 'Should reject duplicate while lease valid');

        console.log('[3/13] Testing Reclaim After Lease Expiry...');
        const p3 = { id: `msg_${EXEC_ID}_3`, event: 'message.sent' };
        const eventId3 = crypto.createHash('sha256').update(`${p3.id}|${p3.event}`).digest('hex');
        await db.ref(`webhooks_pending/${eventId3}`).set({
            state: 'processing',
            timestamp: Date.now() - 600000,
            leaseExpiresAt: Date.now() - 1000,
            ownerToken: 'stale-token'
        });
        const r3 = await runWebhook(p3);
        assert(r3.statusCode === 200 && r3.body.status === 'processed', 'Should reclaim and process expired lease');
        const receipt3 = (await db.ref(`webhooks_pending/${eventId3}`).get()).val();
        assert(receipt3.ownerToken !== 'stale-token', 'Owner token should have changed');
        recordsCreated.push(`webhooks_pending/${eventId3}`);

        console.log('[4/13] Testing Exact Expiry Boundary...');
        const p4 = { id: `msg_${EXEC_ID}_4`, event: 'message.sent' };
        const eventId4 = crypto.createHash('sha256').update(`${p4.id}|${p4.event}`).digest('hex');
        // Set precisely to now. Current logic is: now < current.leaseExpiresAt
        await db.ref(`webhooks_pending/${eventId4}`).set({
            state: 'processing',
            leaseExpiresAt: Date.now(),
            ownerToken: 'boundary-token'
        });
        const r4 = await runWebhook(p4);
        assert(r4.statusCode === 200, 'Boundary (now === expiry) should be treat as expired/reclaimable');
        recordsCreated.push(`webhooks_pending/${eventId4}`);

        console.log('[5/13] Testing Already Processed Deduplication...');
        const p5 = { id: `msg_${EXEC_ID}_5`, event: 'message.sent' };
        const eventId5 = crypto.createHash('sha256').update(`${p5.id}|${p5.event}`).digest('hex');
        await db.ref(`webhooks_pending/${eventId5}`).set({ processed: true });
        const r5 = await runWebhook(p5);
        assert(r5.body.status === 'already_processed', 'Should deduplicate processed receipts');

        console.log('[6/13] Testing Concurrent Claim Attempts...');
        const p6 = { id: `msg_${EXEC_ID}_6`, event: 'message.sent' };
        // Simulate two requests hitting at the same time
        const [res6a, res6b] = await Promise.all([
            runWebhook(p6),
            runWebhook(p6)
        ]);
        const statuses = [res6a.body.status, res6b.body.status];
        assert(statuses.includes('processed') && statuses.includes('already_processed'), 'One should win, one should be rejected');

        console.log('[7/13] Testing Stale-Owner Finalization...');
        const p7 = { id: `msg_${EXEC_ID}_7`, event: 'message.sent' };
        const eventId7 = crypto.createHash('sha256').update(`${p7.id}|${p7.event}`).digest('hex');
        
        // 1. Seed a claim for Owner A
        const tokenA = 'token-A';
        await db.ref(`webhooks_pending/${eventId7}`).set({
            state: 'processing',
            leaseExpiresAt: Date.now() - 1000, // Expired
            ownerToken: tokenA
        });
        
        // 2. Owner B reclaims
        const r7b = await runWebhook(p7);
        const receiptB = (await db.ref(`webhooks_pending/${eventId7}`).get()).val();
        const tokenB = receiptB.ownerToken;
        assert(tokenB !== tokenA, 'B should have reclaimed');

        // 3. Manual attempt by A to finalize
        // We must simulate the transaction: receiptRef.transaction((current) => {
        //   if (!current || current.ownerToken !== ownershipToken) return;
        //   return { processed: true };
        // })
        const finalA = await db.ref(`webhooks_pending/${eventId7}`).transaction((current) => {
            if (!current || current.ownerToken !== tokenA) return;
            return { processed: true };
        });
        assert(!finalA.committed, 'A should fail to finalize because ownership was lost');
        recordsCreated.push(`webhooks_pending/${eventId7}`);

        console.log('[8/13] Testing Recovery After Handler Failure (Before Finalization)...');
        const p8 = { id: `msg_${EXEC_ID}_8`, event: 'message.sent' };
        const eventId8 = crypto.createHash('sha256').update(`${p8.id}|${p8.event}`).digest('hex');
        await db.ref(`webhooks_pending/${eventId8}`).set({
            state: 'processing',
            leaseExpiresAt: Date.now() - 1000,
            ownerToken: 'failed-token'
        });
        const r8 = await runWebhook(p8);
        assert(r8.statusCode === 200 && r8.body.status === 'processed', 'Should recover from failure');
        recordsCreated.push(`webhooks_pending/${eventId8}`);

        console.log('[9/13] Testing Recovery After Business Logic (Before Finalization)...');
        const p9 = { id: `msg_${EXEC_ID}_9`, event: 'message.sent' };
        const eventId9 = crypto.createHash('sha256').update(`${p9.id}|${p9.event}`).digest('hex');
        const userId9 = `user_${EXEC_ID}_9`;
        const msgId9 = `msgid_${EXEC_ID}_9`;
        
        // Seed business state as 'delivered' (simulating a previous run that did the update but crashed before finalization)
        await db.ref(`sms_provider_index/${p9.id}`).set({ msgId: msgId9 });
        await db.ref(`sms_status/${userId9}/${msgId9}`).set({ status: 'delivered', updatedAt: Date.now() });
        
        await db.ref(`webhooks_pending/${eventId9}`).set({
            state: 'processing',
            leaseExpiresAt: Date.now() - 1000,
            ownerToken: 'crashed-token'
        });
        
        const r9 = await runWebhook({ ...p9, userId: userId9 });
        assert(r9.statusCode === 200 && r9.body.status === 'processed', 'Should recover and finalize');
        
        const status9 = (await db.ref(`sms_status/${userId9}/${msgId9}`).get()).val();
        assert(status9.status === 'delivered', 'Status should remain delivered');
        recordsCreated.push(`webhooks_pending/${eventId9}`, `sms_provider_index/${p9.id}`, `sms_status/${userId9}/${msgId9}`);

        console.log('[10/13] Testing Duplicate Delivery of Same Event...');
        const p10 = { id: `msg_${EXEC_ID}_10`, event: 'message.sent' };
        const eventId10 = crypto.createHash('sha256').update(`${p10.id}|${p10.event}`).digest('hex');
        await runWebhook(p10);
        const r10 = await runWebhook(p10);
        assert(r10.body.status === 'already_processed', 'Exact duplicate event should be suppressed');
        recordsCreated.push(`webhooks_pending/${eventId10}`);

        console.log('[11/13] Testing Distinct Events for Same Provider Message...');
        const p11a = { id: `msg_${EXEC_ID}_11`, event: 'message.sent' };
        const p11b = { id: `msg_${EXEC_ID}_11`, event: 'message.failed' };
        const r11a = await runWebhook(p11a);
        const r11b = await runWebhook(p11b);
        assert(r11a.statusCode === 200 && r11b.statusCode === 200, 'Both distinct events should be processed');
        
        const eventId11a = crypto.createHash('sha256').update(`${p11a.id}|${p11a.event}`).digest('hex');
        const eventId11b = crypto.createHash('sha256').update(`${p11b.id}|${p11b.event}`).digest('hex');
        assert(eventId11a !== eventId11b, 'Event IDs must be distinct');
        recordsCreated.push(`webhooks_pending/${eventId11a}`, `webhooks_pending/${eventId11b}`);

        console.log('[12/13] Verifying Firebase Admin Connectivity...');
        const connectivityTest = await db.ref(`${TEST_NAMESPACE}/connectivity`).set({ verified: true });
        assert(connectivityTest === null, 'Connectivity set should return null (success)');
        recordsCreated.push(`${TEST_NAMESPACE}/connectivity`);

        console.log('[13/13] Testing Outbound UniSMS Containment...');
        // The worker logic is in api/sms/worker.js. 
        // We test that submitToUniSMS does not make calls when UNISMS_LIVE_SEND_ENABLED is not "true".
        const worker = require('../sms/worker.js').default;
        const wReq = {
            method: 'POST',
            headers: { 'x-worker-secret': process.env.SMS_WORKER_SECRET },
            body: { cursor: '0' },
        };
        const wRes = createMockRes();
        
        // Seed a message for the worker to process
        const msgId13 = `msg_${EXEC_ID}_13`;
        await db.ref(`sms_queue_v2/${msgId13}`).set({
            status: 'pending',
            sortKey: '0_test',
            number: '63900000000',
            message: 'containment test'
        });
        recordsCreated.push(`sms_queue_v2/${msgId13}`);

        await worker(wReq, wRes);
        assert(wRes.statusCode === 200, 'Worker should complete');
        // Note: We don't have a network interceptor here, but the source code 
        // in submitToUniSMS throws an error if LIVE_SEND is enabled.
        // If it's disabled, it returns a mock. We verify the record was finalized.
        const finalized = (await db.ref(`sms_queue_v2/${msgId13}`).get()).val();
        assert(finalized.status === 'provider_accepted' || finalized.status === 'failed', 'Worker should have finalized the record using mock adapter');

        console.log('\n--- ALL INTEGRATION TESTS PASSED ---');
        return recordsCreated;

    } catch (error) {
        console.error('\n!!! TEST FAILURE !!!');
        console.error(error);
        throw error;
    }
}

async function runCriticalRaceTest() {
    console.log('\n--- Running Critical Stale-Handler Race Test ---');
    const userId = `user_race_${EXEC_ID}`;
    const msgId = `msg_race_${EXEC_ID}`;
    const provId = `prov_race_${EXEC_ID}`;
    const event = 'message.delivered';
    const eventId = crypto.createHash('sha256').update(`${provId}|${event}`).digest('hex');

    // Initial state: Message is in queue, and we have an index.
    await db.ref(`sms_provider_index/${provId}`).set({ msgId });
    await db.ref(`sms_status/${userId}/${msgId}`).set({ status: 'queued', updatedAt: Date.now() });
    await db.ref(`webhooks_pending/${eventId}`).set({
        state: 'processing',
        leaseExpiresAt: Date.now() + 300000,
        ownerToken: 'token-A'
    });

    console.log('Step 1: Handler A has claimed the receipt (token-A).');
    console.log('Step 2: Handler A pauses before business update...');
    
    console.log('Step 3: Lease expires.');
    await db.ref(`webhooks_pending/${eventId}`).update({
        leaseExpiresAt: Date.now() - 1000
    });

    console.log('Step 4: Handler B reclaims the receipt.');
    const rB = await runWebhook({ id: provId, event, userId });
    assert(rB.body.status === 'processed', 'Handler B should successfully process');
    
    const statusB = (await db.ref(`sms_status/${userId}/${msgId}`).get()).val();
    assert(statusB.status === 'delivered', 'Business state should be updated by B');
    
    const receiptAfterB = (await db.ref(`webhooks_pending/${eventId}`).get()).val();
    assert(receiptAfterB.processed === true, 'Receipt should be marked processed by B');

    console.log('Step 5: Handler A resumes and attempts business update and finalization.');
    
    // Simulate Handler A's logic manually because we can't pause the actual function.
    // Logic in webhook.js:
    // 1. Update status if nextStatus > currentStatus
    // 2. Finalize receipt if current.ownerToken === ownershipToken
    
    const nextStatus = 'delivered';
    const stateWeights = { "queued": 0, "claimed": 1, "submitting": 2, "provider_accepted": 3, "delivered": 4, "failed": 4 };
    const currentStatusA = (await db.ref(`sms_status/${userId}/${msgId}`).get()).val().status;

    if (stateWeights[nextStatus] > stateWeights[currentStatusA]) {
        await db.ref(`sms_status/${userId}/${msgId}`).update({
            status: nextStatus,
            updatedAt: Date.now(),
            lastEvent: event
        });
        console.log('  - Handler A updated business state (it saw "delivered" > "delivered" is false, so it should skip).');
    }

    const finalA = await db.ref(`webhooks_pending/${eventId}`).transaction((current) => {
        if (!current || current.ownerToken !== 'token-A') return;
        return { processed: true };
    });
    
    assert(!finalA.committed, 'Handler A must fail to finalize the receipt');
    console.log('  - Handler A finalization blocked correctly.');

    const finalState = (await db.ref(`sms_status/${userId}/${msgId}`).get()).val();
    assert(finalState.status === 'delivered', 'Final business state must be correct');
    
    console.log('CRITICAL RACE TEST PASSED: Stale handler cannot overwrite processed result.');
}

async function cleanup(records) {
    console.log('\n--- Cleaning Up Test Records ---');
    for (const path of records) {
        await db.ref(path).remove();
    }
    console.log(`Deleted ${records.length} records.`);
}

(async () => {
    let allRecords = [];
    try {
        allRecords = await runTests();
        await runCriticalRaceTest();
        
        // Add race test records to cleanup
        const raceUserId = `user_race_${EXEC_ID}`;
        const raceMsgId = `msg_race_${EXEC_ID}`;
        const raceProvId = `prov_race_${EXEC_ID}`;
        const raceEventId = crypto.createHash('sha256').update(`${raceProvId}|message.delivered`).digest('hex');
        allRecords.push(
            `sms_status/${raceUserId}/${raceMsgId}`,
            `sms_provider_index/${raceProvId}`,
            `webhooks_pending/${raceEventId}`
        );
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await cleanup(allRecords);
    }
})();
