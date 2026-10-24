import sys

path = 'api/__tests__/sms.test.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the start and end of the specific test
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'it("should prevent stale worker from overwriting newer claim"' in line:
        start_idx = i
    if '    });' in line and start_idx != -1:
        # This is tricky because of nesting. I'll look for the one that ends the test.
        # Since the file is small, I'll just find the next '});' that aligns with the start_idx.
        # Actually, let's just replace the whole block by finding the indices.
        pass

# Based on previous Read, the test is roughly lines 167-220.
# I'll use a more precise range based on current file content.
# The start is at index 166 (line 167).
# The end is at index 219 (line 220).

new_content = [
    '    it("should prevent stale worker from overwriting newer claim", async () => {\n',
    '      process.env.SMS_WORKER_SECRET = "secret";\n',
    '      const msgId = "msg_stale";\n',
    '\n',
    '      // 1. Seed a record that is ALREADY claimed but EXPIRED\n',
    '      const tokenA = "token-a";\n',
    '      await db.ref(`sms_queue_v2/${msgId}`).set({\n',
    '        status: "claimed",\n',
    '        claimToken: tokenA,\n',
    '        leaseExpiresAt: Date.now() - 1000,\n',
    '        sortKey: "100_stale",\n',
    '        submissionCount: 0\n',
    '      });\n',
    '\n',
    '      // 2. Worker B reclaims it\n',
    '      const mockReq = {\n',
    '        method: "POST",\n',
    '        headers: { "x-worker-secret": "secret" },\n',
    '        body: { cursor: "0" },\n',
    '      };\n',
    '      await handler(mockReq, mockRes);\n',
    '      \n',
    '      // Allow mock latency to commit\n',
    '      await new Promise(resolve => setTimeout(resolve, 200));\n',
    '      \n',
    '      const stateB = (await db.ref(`sms_queue_v2/${msgId}`).get()).val();\n',
    '      const tokenB = stateB.claimToken;\n',
    '      expect(tokenB).toBeDefined();\n',
    '      expect(tokenB).not.toBe(tokenA);\n',
    '\n',
    '      // 3. Advance B to \'submitting\' to prepare for the race\n',
    '      await db.ref(`sms_queue_v2/${msgId}`).update({\n',
    '        status: "submitting",\n',
    '      });\n',
    '\n',
    '      // 4. Worker A (stale) now attempts to finalize using its old token\n',
    '      const { finalizeMessage } = await import("../sms/worker.js");\n',
    '      const mockSubmission = { status: "accepted", refId: "uni_stale_test" };\n',
    '      const admin = initFirebaseAdmin();\n',
    '      const finalizationResult = await finalizeMessage(admin.db, msgId, tokenA, mockSubmission, { submissionCount: 1 });\n',
    '      \n',
    '      expect(finalizationResult.committed).toBe(false);\n',
    '\n',
    '      // 5. Verify B\'s ownership remains intact\n',
    '      const finalState = (await db.ref(`sms_queue_v2/${msgId}`).get()).val();\n',
    '      expect(finalState.claimToken).toBe(tokenB);\n',
    '      expect(finalState.status).toBe("submitting");\n',
    '    });\n'
]

# We need to find the exact indices again.
# Let's find 'it("should prevent stale worker from overwriting newer claim"'
current_start = -1
for i, line in enumerate(lines):
    if 'it("should prevent stale worker from overwriting newer claim"' in line:
        current_start = i
        break

# Find the matching end '});'
# For simplicity, I'll count the braces.
brace_count = 0
current_end = -1
for i in range(current_start, len(lines)):
    brace_count += lines[i].count('{')
    brace_count -= lines[i].count('}')
    if brace_count == 0 and i > current_start:
        current_end = i + 1
        break

lines[current_start:current_end] = new_content

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
