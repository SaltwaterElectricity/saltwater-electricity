
import os

file_path = r'C:/Users/Admin/testcode/sms-api-migration/api/sms/worker.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = 'async function submitToUniSMS(_record) {'
start_idx = content.find(start_marker)

if start_idx == -1:
    print("Could not find function start marker")
    exit(1)

new_function = """async function submitToUniSMS(_record) {
  // 1. Live-Send Safety Guard
  if (process.env.UNISMS_LIVE_SEND_ENABLED !== "true") {
    // Mocked behavior for local testing/development (Deterministic 80/10/10)
    await new Promise(resolve => setTimeout(resolve, 100));
    const rand = Math.random();
    if (rand > 0.2) {
      return { status: "accepted", refId: `uni_${Math.random().toString(36).substr(2, 9)}` };
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
      
      const lookupRes = await fetch(`${apiUrl}/sms/${_record.providerRefId}`, {
        headers: {
          "Authorization": `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
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
      console.error(`[UniSMS] Lookup failed for ${_record.providerRefId}:`, error.message);
      // On lookup error, we proceed to avoid blocking delivery, 
      // but this is where the ambiguity risk lies.
    }
  }

  // B. Provider Submission
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000); // 7s limit to leave room for DB finalize

  try {
    const response = await fetch(`${apiUrl}/sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
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
      return { status: "rejected", error: f"Provider rejection: {response.status}" };
    } else if (response.status === 429) {
      return { status: "unknown", error: "Rate limited (429)" };
    } else {
      return { status: "unknown", error: f"Provider error: {response.status}" };
    }
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === "AbortError") {
      return { status: "unknown", error: "Request timed out" };
    }
    throw error;
  }
}"""

# Replace from start_idx to the end of the file since the function is at the end.
final_content = content[:start_idx] + new_function
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("Successfully updated worker.js via python script")
