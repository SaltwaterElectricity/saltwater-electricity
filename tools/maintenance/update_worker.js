
const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/Admin/testcode/sms-api-migration/api/sms/worker.js';
let content = fs.readFileSync(filePath, 'utf8');

const newFunction = `async function submitToUniSMS(_record) {
  // 1. Live-Send Safety Guard
  if (process.env.UNISMS_LIVE_SEND_ENABLED !== "true") {
    // Mocked behavior for local testing/development (Deterministic 80/10/10)
    await new Promise(resolve => setTimeout(resolve, 100));
    const rand = Math.random();
    if (rand > 0.2) {
      return { status: "accepted", refId: \`uni_${Math.random().toString(36).substr(2, 9)}\` };
    } else if (rand > 0.1) {
      return { status: "rejected", error: "Invalid number" };
    } else {
      throw new Error("Connection reset by peer");
    }
  }

  // 2. Real UniSMS Provider Implementation
  const apiUrl = process.env.UNISMS_API_URL || "https://unismsapi.com/api";
  const apiKey = process.env.UNISMS_API_KEY;
  const senderId = process.env.UNISMS_SENDER_ID;

  if (!apiKey || !senderId) {
    throw new Error("[SECURITY] UniSMS provider configuration missing (API_KEY or SENDER_ID).");
  }

  // A. Duplicate-Send Protection: Lookup existing reference
  if (_record.providerRefId) {
    try {
      const lookupController = new AbortController();
      const lookupTimeout = setTimeout(() => lookupController.abort(), 5000);
      
      const lookupRes = await fetch(\`${apiUrl}/sms/${_record.providerRefId}\`, {
        headers: {
          "Authorization": \`Basic ${Buffer.from(apiKey + ":").toString("base64")}\`,
        },
        signal: lookupController.signal,
      });
      
      clearTimeout(lookupTimeout);
      
      if (lookupRes.ok) {
        const lookupData = await lookupRes.json();
        const providerStatus = lookupData.status; // pending, retrying, sent, failed
        
        // If it's still in flight or already sent, do not resubmit
        if (["pending", "retrying", "sent"].includes(providerStatus)) {
          return { status: "accepted", refId: _record.providerRefId };
        }
        // If it explicitly failed, we can proceed to resubmit
      }
    } catch (error) {
      console.error(\`[UniSMS] Lookup failed for ${_record.providerRefId}:\`, error.message);
      // On lookup error, we proceed to avoid blocking delivery, 
      // but this is where the ambiguity risk lies.
    }
  }

  // B. Provider Submission
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000); // 7s limit to leave room for DB finalize

  try {
    const response = await fetch(\`${apiUrl}/sms\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Basic ${Buffer.from(apiKey + ":").toString("base64")}\`,
      },
      body: JSON.stringify({
        recipient: _record.number,
        content: _record.message,
        sender_id: senderId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.status === 201) {
      const data = await response.json();
      const refId = data.message?.reference_id;
      if (refId) {
        return { status: "accepted", refId };
      }
      // Malformed 201
      return { status: "unknown", error: "Missing reference_id in 201 response" };
    } else if (response.status === 400 || response.status === 422) {
      return { status: "rejected", error: \`Provider rejection: ${response.status}\` };
    } else if (response.status === 429) {
      return { status: "unknown", error: "Rate limited (429)" };
    } else {
      return { status: "unknown", error: \`Provider error: ${response.status}\` };
    }
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === "AbortError") {
      return { status: "unknown", error: "Request timed out" };
    }
    throw error;
  }
}`;

const startMarker = 'async function submitToUniSMS(_record) {';
const endMarker = '}

// 2. Mocked behavior for local testing/development'; // This is tricky.

// I'll just replace the whole function from the start of the function to the end of the file, 
// since it's the last function in the file.
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Could not find function start marker');
  process.exit(1);
}

const finalContent = content.substring(0, startIndex) + newFunction;
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('Successfully updated worker.js');
