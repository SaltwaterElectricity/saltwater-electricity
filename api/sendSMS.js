import axios from "axios";

/**
 * Vercel Serverless Function: sendSMS
 * Securely triggers Semaphore SMS alerts from the backend.
 * Adheres to the SUEP Protocol (Secure & User-Friendly Error Handling).
 */
export default async function handler(req, res) {
  // 1. CORS Configuration
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // 2. Security: Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 3. Initialize Semaphore Configuration
  const apiKey = process.env.SEMAPHORE_API_KEY;
  
  // SEMAPHORE FREE TIER: Custom sender names (Sender ID) require a paid account and approval.
  // Use the default "SEMAPHORE" for free/trial accounts to avoid API errors.
  const senderName = process.env.SEMAPHORE_SENDER_NAME || "SEMAPHORE";

  if (!apiKey) {
    console.error("Server Configuration Error: SEMAPHORE_API_KEY environment variable missing.");
    return res.status(500).json({ error: "SMS service unavailable." });
  }

  try {
    const { number, message } = req.body;

    // 4. Validation
    if (!number || !message) {
      return res.status(400).json({ error: "Missing recipient number or message content." });
    }

    // 5. Trigger Semaphore API (POST)
    const response = await axios.post("https://api.semaphore.co/api/v4/messages", {
      apikey: apiKey,
      number: number,
      message: message,
      sendername: senderName,
    });

    // 6. Success Response
    return res.status(200).json({ 
      success: true, 
      data: response.data 
    });

  } catch (error) {
    // SECURITY: Log technical details internally
    console.error("Semaphore API Error:", error.response?.data || error.message);

    // UX: Mask technical failure with a sanitized response
    return res.status(500).json({
      error: "Failed to deliver SMS alert.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
