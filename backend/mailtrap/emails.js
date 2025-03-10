import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
	WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";
import transporter from "../nodemailer/nodemailer.js";


export const sendVerificationEmail = async (email, verificationToken) => {
	const recipient = [{ email }];

	try {
		// Replace the verification token placeholder in the template with the actual verification token
		const response = await transporter.sendMail({
			from: process.env.SENDER_EMAIL, // Use the sender email from environment variables
			to: email, // Directly use the email parameter
			subject: "Verify your email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken), // Use the HTML template
		});

		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);
		throw new Error(`Error sending verification email: ${error}`);
	}
};


export const sendWelcomeEmail = async (email, name) => {
	const recipient = email; // Directly use the email parameter

	try {
		// Replace the placeholders in the template with actual values
		const htmlContent = WELCOME_EMAIL_TEMPLATE
			.replaceAll("{company_info_name}", "CRM_App") // Replace with actual company name
			.replaceAll("{recipient_name}", name); // Replace with actual recipient name

		const response = await transporter.sendMail({
			from: process.env.SENDER_EMAIL, // Use the sender email from environment variables
			to: recipient, // Use the recipient email
			subject: "Welcome to CRM_App!", // Subject of the email
			html: htmlContent, // Use the HTML content with replaced placeholders
		});

		console.log("Welcome email sent successfully", response);
	} catch (error) {
		console.error(`Error sending welcome email`, error);
		throw new Error(`Error sending welcome email: ${error}`);
	}
};



export const sendPasswordResetEmail = async (email, resetURL) => {
	const recipient = email; // Directly use the email parameter

	try {
		const htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL); // Replace the reset URL in the template

		const response = await transporter.sendMail({
			from: process.env.SENDER_EMAIL, // Use the sender email from environment variables
			to: recipient, // Use the recipient email
			subject: "Reset your password", // Subject of the email
			html: htmlContent, // Use the HTML content with the replaced reset URL
		});

		console.log("Password reset email sent successfully", response);
	} catch (error) {
		console.error(`Error sending password reset email`, error);
		throw new Error(`Error sending password reset email: ${error}`);
	}
};

export const sendResetSuccessEmail = async (email) => {
	const recipient = email; // Directly use the email parameter

	try {
		const response = await transporter.sendMail({
			from: process.env.SENDER_EMAIL, // Use the sender email from environment variables
			to: recipient, // Use the recipient email
			subject: "Password Reset Successful", // Subject of the email
			html: PASSWORD_RESET_SUCCESS_TEMPLATE, // Use the HTML template for success
		});

		console.log("Password reset success email sent successfully", response);
	} catch (error) {
		console.error(`Error sending password reset success email`, error);
		throw new Error(`Error sending password reset success email: ${error}`);
	}
};