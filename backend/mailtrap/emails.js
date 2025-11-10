import axios from "axios";
import dotenv from "dotenv";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

dotenv.config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// ✅ Reusable function to send emails via Brevo API
const sendEmail = async ({ to, subject, html }) => {
  try {
    const emailData = {
      sender: {
        name: process.env.SENDER_NAME || "CRM_App Team",
        email: process.env.SENDER_EMAIL, // must be verified in Brevo
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: "If you cannot view this email, please use an HTML-compatible client.",
    };

    const response = await axios.post(BREVO_API_URL, emailData, {
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
    });

    console.log("✅ Email sent successfully to:", to);
    console.log("Brevo response:", response.data);
  } catch (error) {
    console.error("❌ Error sending email:", error.response?.data || error.message);
    throw new Error("Failed to send email");
  }
};

// ✅ Send verification email
export const sendVerificationEmail = async (email, verificationToken) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);

  await sendEmail({
    to: email,
    subject: "Verify your email address",
    html,
  });
};

// ✅ Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  const html = WELCOME_EMAIL_TEMPLATE
    .replaceAll("{company_info_name}", "CRM_App")
    .replaceAll("{recipient_name}", name);

  await sendEmail({
    to: email,
    subject: "Welcome to CRM_App!",
    html,
  });
};

// ✅ Send password reset email
export const sendPasswordResetEmail = async (email, resetURL) => {
	console.log("this is the reset URL,",resetURL)
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html,
  });
};

// ✅ Send password reset success email
export const sendResetSuccessEmail = async (email) => {
  await sendEmail({
    to: email,
    subject: "Password Reset Successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  });
};
