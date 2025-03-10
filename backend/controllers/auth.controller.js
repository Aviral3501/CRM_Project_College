import bcryptjs from "bcryptjs"; // Import bcryptjs for password hashing
import crypto from "crypto"; // Import crypto for generating secure tokens

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"; // Import token generation utility
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../mailtrap/emails.js"; // Import email sending functions
import { User } from "../models/user.model.js"; // Import User model
import transporter from "../nodemailer/nodemailer.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "../mailtrap/emailTemplates.js";

// Signup function to register a new user
export const signup = async (req, res) => {
	const { email, password, name } = req.body; // Destructure request body

	try {
		// Check if all required fields are provided
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

        // Check if user already exists
		const userAlreadyExists = await User.findOne({ email });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

        // Hash the password for security
		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // Generate verification token

		const user = new User({
			email,
			password: hashedPassword,
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 24 hours
		});

        // Save the new user to the database and then create a token for the client 
		await user.save();

		// Generate JWT token and set it in a cookie
		generateTokenAndSetCookie(res, user._id);

        // Send verification email to the user
		await sendVerificationEmail(user.email, verificationToken);


		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined, // Exclude password from response
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message }); // Handle errors
	}
};

// Verify email function to confirm user email
export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Login function to authenticate user
export const login = async (req, res) => {
	const { email, password } = req.body; // Get email and password from request body
	try {
		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		// Check if password is valid
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

        // Generate tokens and set the cookie
		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date(); // Update last login time
        // Save user info
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined, // Exclude password from response
			},
		});
	} catch (error) {
		console.log("Error in login ", error); 
		res.status(400).json({ success: false, message: error.message }); 
	}
};

// Logout function to clear user session
export const logout = async (req, res) => {
    // Clear the cookie
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Forgot password function to initiate password reset
export const forgotPassword = async (req, res) => {
	const { email } = req.body; // Get email from request body
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex"); // Create a secure random token
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // Token expires in 1 hour

		user.resetPasswordToken = resetToken; // Set reset token
		user.resetPasswordExpiresAt = resetTokenExpiresAt; // Set expiration time

		await user.save(); // Save user with reset token

		// Send password reset email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error); 
		res.status(400).json({ success: false, message: error.message }); 
	}
};

// Reset password function to update user password
export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params; // Get reset token from request parameters
		const { password } = req.body; // Get new password from request body

		// Find user by reset token
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() }, // Check if token is still valid
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// Update password
		const hashedPassword = await bcryptjs.hash(password, 10); // Hash new password

		user.password = hashedPassword; // Set new password
		user.resetPasswordToken = undefined; // Clear reset token
		user.resetPasswordExpiresAt = undefined; // Clear expiration time
		await user.save(); // Save updated user

		await sendResetSuccessEmail(user.email); // Send success email

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error); 
		res.status(400).json({ success: false, message: error.message }); 
	}
};

// Check authentication function to verify user session
export const checkAuth = async (req, res) => {
	try {
		// Find user by ID from request
		const user = await User.findById(req.userId).select("-password"); // Exclude password from response
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user }); // Return user information
	} catch (error) {
		console.log("Error in checkAuth ", error); 
		res.status(400).json({ success: false, message: error.message }); 
	}
};