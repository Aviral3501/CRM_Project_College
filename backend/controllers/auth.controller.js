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
import { Organization } from "../models/org.model.js";

// Helper function to generate 6-digit OTP
const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup function to register a new user
export const signup = async (req, res) => {
	try {
		const { name, email, password, organizationName } = req.body;

		console.log("Attempting to find organization:", organizationName); // Debug log

		// Check if organization exists using exact name match first
		const organization = await Organization.findOne({ name: organizationName });
		
		if (!organization) {
			console.log("No organization found with name:", organizationName); // Debug log
			return res.status(400).json({
				success: false,
				message: `Organization "${organizationName}" not found. Please check the organization name and try again.`
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "Email already registered"
			});
		}

		// Hash password
		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(password, salt);

		// Generate 6-digit OTP
		const verificationToken = generateOTP();
		const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		// Create user
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
			role: "employee",
			organization: organization._id,
			verificationToken,
			verificationTokenExpiresAt,
			createdBy: organization.admin
		});

		// Add user to organization's employees array
		organization.employees.push(user._id);
		await organization.save();

		// Generate token and set cookie
		const token = generateTokenAndSetCookie(res, user._id);

		// Send verification email
		await sendVerificationEmail(email, verificationToken);

		res.status(201).json({
			success: true,
			message: "Account created successfully",
			user: {
				id: user._id,
				user_id: user.user_id,
				organization_id: organization.org_id,
				name: user.name,
				email: user.email,
				organization: organization.name
			}
		});

	} catch (error) {
		console.error("Error in signup: ", error);
		res.status(500).json({
			success: false,
			message: "Error creating account"
		});
	}
};

// Verify email function to confirm user email
export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		// Find user with matching OTP
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ 
				success: false, 
				message: "Invalid or expired OTP" 
			});
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

		// Get organization details
		const organization = await Organization.findById(user.organization);

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				user_id: user.user_id,
				organization_id: organization.org_id,
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
		await sendPasswordResetEmail(user.email, `${process.env.VITE_FRONTEND_URL}/reset-password/${resetToken}`);

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

export const adminSignup = async (req, res) => {
	try {
		const { 
			organizationName, 
			industry, 
			location, 
			website,
			adminName,
			adminEmail,
			adminPassword 
		} = req.body;

		// Check if organization already exists
		const existingOrg = await Organization.findOne({ name: organizationName });
		if (existingOrg) {
			return res.status(400).json({ 
				success: false, 
				message: "Organization already exists" 
			});
		}

		// Check if admin email already exists
		const existingAdmin = await User.findOne({ email: adminEmail });
		if (existingAdmin) {
			return res.status(400).json({ 
				success: false, 
				message: "Email already registered" 
			});
		}

		// Create organization first
		let organization;
		try {
			organization = await Organization.create({
				name: organizationName,
				industry,
				address: location,
				website
			});
		} catch (error) {
			console.error("Error creating organization:", error);
			return res.status(500).json({
				success: false,
				message: "Error creating organization"
			});
		}

		// Hash password
		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(adminPassword, salt);

		// Generate 6-digit OTP
		const verificationToken = generateOTP();
		const verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

		// Create admin user
		let admin;
		try {
			admin = await User.create({
				name: adminName,
				email: adminEmail,
				password: hashedPassword,
				role: "admin",
				verificationToken,
				verificationTokenExpiresAt,
				organization: organization._id
			});
		} catch (error) {
			// If admin creation fails, delete the organization
			await Organization.findByIdAndDelete(organization._id);
			console.error("Error creating admin:", error);
			return res.status(500).json({
				success: false,
				message: "Error creating admin account"
			});
		}

		// Update organization with admin reference
		try {
			organization.admin = admin._id;
			organization.employees = [admin._id];
			organization.createdBy = admin._id;
			await organization.save();
		} catch (error) {
			// If organization update fails, clean up both records
			await User.findByIdAndDelete(admin._id);
			await Organization.findByIdAndDelete(organization._id);
			console.error("Error updating organization:", error);
			return res.status(500).json({
				success: false,
				message: "Error linking admin to organization"
			});
		}

		// Generate token and set cookie
		const token = generateTokenAndSetCookie(res, admin._id);

		// Send verification email with OTP
		try {
			await sendVerificationEmail(adminEmail, verificationToken);
		} catch (error) {
			console.error("Error sending verification email:", error);
			// Continue with the response even if email fails
		}

		res.status(201).json({
			success: true,
			message: "Organization and admin account created successfully. Please check your email for verification OTP.",
			organization: {
				id: organization.org_id,
				name: organization.name
			},
			admin: {
				id: admin._id,
				user_id: admin.user_id,
				organization_id: organization.org_id,
				name: admin.name,
				email: admin.email
			}
		});

	} catch (error) {
		console.error("Error in adminSignup:", error);
		res.status(500).json({ 
			success: false, 
			message: "Error creating organization and admin account" 
		});
	}
};