import brevo from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

// Initialize API client
const defaultClient = brevo.ApiClient.instance;

// Configure API key
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Create transactional email API instance
const apiInstance = new brevo.TransactionalEmailsApi();

// Sender (verified in Brevo)
export const sender = {
  name: process.env.SENDER_NAME || "CRM_App Team",
  email: process.env.SENDER_EMAIL,
};

// Debug logs
console.log("✅ Brevo Config Loaded:");
console.log("   - API Key Loaded:", !!process.env.BREVO_API_KEY);
console.log("   - Sender:", sender);

export default apiInstance;
