const { execSync } = require('child_process');

async function runRaceTest() {
  console.log('--- Baseline: OTP Attempt Race Condition Test ---');
  
  const testEmail = 'race.test@example.com';
  const trackingId = testEmail.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, "");
  
  try {
    console.log('Triggering OTP generation...');
    execSync(`curl -X POST -H "Content-Type: application/json" -d '{"email":"${testEmail}"}' http://localhost:5173/api/generateOTP`, { stdio: 'pipe' });

    console.log('\nSending 5 concurrent invalid OTP requests...');
    // Use bash & to send concurrent requests
    const cmd = `for i in {1..5}; do curl -s -X POST -H "Content-Type: application/json" -d '{"trackingId":"${trackingId}", "code":"000000"}' http://localhost:5173/api/verifyOTP & done; wait`;
    execSync(cmd, { encoding: 'utf8' });
    console.log('Responses received.');
    
    // In a real scenario, we would then check the RTDB to see if attempts > 3.
    console.log('\nAnalysis: The current code uses a non-atomic read-modify-write pattern.');
    console.log('Expected: At least some requests may have bypassed the 3-attempt limit if processed simultaneously.');
    
  } catch (e) {
    console.error('❌ Race test failed:', e.message);
  }
}

runRaceTest();
