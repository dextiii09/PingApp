
// --- SENDPULSE CONFIGURATION ---
// 1. Login to SendPulse -> Account Settings -> API
// 2. Activate REST API to get ID and Secret
// 3. Ensure you have a verified "Sender Email" in SendPulse Service Settings

const CONFIG = {
  // WARNING: Storing Client Secret in frontend code is insecure for production apps.
  // Ideally, use a backend proxy for this.
  CLIENT_ID: "YOUR_SENDPULSE_ID", 
  CLIENT_SECRET: "YOUR_SENDPULSE_SECRET",
  
  // This email MUST be verified in your SendPulse account
  FROM_EMAIL: "sender@yourdomain.com", 
  FROM_NAME: "Ping App"
};

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Encodes a string to Base64 (needed for SendPulse HTML body)
 */
const toBase64 = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return "";
  }
};

/**
 * Authenticates with SendPulse to get a Bearer Token
 */
const getAccessToken = async (): Promise<string | null> => {
  // Return cached token if valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch('https://api.sendpulse.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: CONFIG.CLIENT_ID,
        client_secret: CONFIG.CLIENT_SECRET,
      })
    });

    const data = await response.json();

    if (data.access_token) {
      accessToken = data.access_token;
      // Set expiry to now + expires_in (minus 60s buffer)
      tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
      return accessToken;
    } else {
      console.error("SendPulse Auth Failed:", data);
      return null;
    }
  } catch (error) {
    console.error("Network Error (Auth):", error);
    return null;
  }
};

export const emailService = {
  init: () => {
    // No initialization needed for REST API, simply check if config is present
    if (CONFIG.CLIENT_ID === "YOUR_SENDPULSE_ID") {
      console.warn("SendPulse is not configured. Please update services/emailService.ts");
    }
  },

  /**
   * Send an email using SendPulse SMTP API
   */
  sendEmail: async (toName: string, toEmail: string, message: string) => {
    // Mock simulation if config is missing
    if (CONFIG.CLIENT_ID === "YOUR_SENDPULSE_ID") {
      console.log("Mock Email Sent (SendPulse Config missing):", { toName, toEmail, message });
      return { success: true, mock: true };
    }

    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: "Authentication failed" };
    }

    const emailData = {
      email: {
        html: toBase64(`<p>${message}</p>`), // Base64 encoded HTML content
        text: message,
        subject: `New Message from ${CONFIG.FROM_NAME}`,
        from: {
          name: CONFIG.FROM_NAME,
          email: CONFIG.FROM_EMAIL
        },
        to: [
          {
            name: toName,
            email: toEmail
          }
        ]
      }
    };

    try {
      const response = await fetch('https://api.sendpulse.com/smtp/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (result.result === true) {
        console.log('Email sent successfully via SendPulse!');
        return { success: true, response: result };
      } else {
        console.error('SendPulse API Error:', result);
        return { success: false, error: result };
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      // Fallback for CORS errors in development
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
         console.warn("CORS Error detected. SendPulse API blocks direct browser calls. Use a proxy or server.");
         return { success: false, error: "CORS_BLOCK" };
      }
      return { success: false, error };
    }
  }
};
