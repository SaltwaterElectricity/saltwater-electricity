import sgMail from "@sendgrid/mail";

/**
 * Vercel Serverless Function: sendProvisioningEmail
 * Securely triggers SendGrid emails from the backend.
 */
export default async function handler(req, res) {
  // 1. CORS Configuration: Allow requests from your frontend origin
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*"); // Update this to your production domain for extra security
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

  // 3. Initialize SendGrid
  const apiKey = process.env.SENDGRID_API_KEY;
  const senderEmail = process.env.SENDGRID_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    console.error("Server Configuration Error: SendGrid environment variables missing.");
    return res.status(500).json({ error: "Mail service unavailable." });
  }

  sgMail.setApiKey(apiKey);

  try {
    const { to, subject, templateType, templateData, htmlContent } = req.body;

    // 4. Validation
    if (!to || !subject) {
      return res.status(400).json({ error: "Missing recipient or subject." });
    }

    // 5. Construct Email Body (Supports Templates or Raw HTML)
    let finalHtml = htmlContent;

    if (templateType === "onboarding") {
      finalHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #006591;">Welcome to Saltwater Electricity</h2>
          <p>Hello ${templateData.firstName || "User"},</p>
          <p>Your account is ready. Use the credentials below to log in:</p>
          <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Username:</strong> ${templateData.userName}</p>
            <p><strong>Temporary Password:</strong> ${templateData.tempPassword}</p>
            <p><strong>System Role:</strong> ${templateData.role}</p>
          </div>
          <p>Change your password immediately after first login.</p>
        </div>
      `;
    } else if (templateType === "otp") {
      finalHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #006591;">Security Code</h2>
          <p>Your 6-digit verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0;">
            ${templateData.otpCode}
          </div>
          <p>This code expires in 15 minutes.</p>
        </div>
      `;
    }

    const msg = {
      to,
      from: {
        email: senderEmail,
        name: "Saltwater Electricity System",
      },
      subject,
      html: finalHtml,
    };

    // 6. Send
    await sgMail.send(msg);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error.message);
    return res.status(500).json({
      error: "Failed to deliver message.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
