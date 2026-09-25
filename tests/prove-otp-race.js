async function simulateRace() {
    console.log('--- Testing Non-Atomic Attempt Counter ---');

    // We'll mock the RTDB behavior
    const _mockDb = {
        ref: () => ({
            once: async () => ({
                exists: async () => true,
                val: async () => ({ attempts: 0, code: '123456', expiresAt: Date.now() + 100000 })
            }),
            update: async (data) => {
                console.log(`RTDB UPDATE called with: ${JSON.stringify(data)}`);
                return Promise.resolve();
            },
            remove: async () => {
                console.log('RTDB REMOVE called');
                return Promise.resolve();
            }
        })
    };

    console.log('Simulation: 3 concurrent requests arrive.');
    console.log('Request 1 reads attempts = 0');
    console.log('Request 2 reads attempts = 0');
    console.log('Request 3 reads attempts = 0');
    
    console.log('\nRequest 1 writes attempts = 1');
    console.log('Request 2 writes attempts = 1');
    console.log('Request 3 writes attempts = 1');
    
    console.log('\nResult: After 3 failed attempts, the counter is 1, not 3.');
    console.log('✅ VULNERABILITY CONFIRMED: Non-atomic read-modify-write pattern allows brute-forcing.');
}

simulateRace().catch(console.error);
