import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { User } from "../models/user.model.js";
import { Organization } from "../models/org.model.js";

const router = express.Router();

// All routes are protected and require authentication
router.use(protectRoute);

// POST /api/org-users/list - Get all users in an organization
router.post("/list", async (req, res) => {
    try {
        const { organization_id } = req.body;

        // Find organization
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        // Get all users in the organization
        const users = await User.find({ organization: organization._id })
            .select('-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt')
            .populate('organization', 'name industry');

        res.status(200).json({
            success: true,
            users: users.map(user => ({
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                profileImage: user.profileImage,
                permissions: user.permissions,
                lastLogin: user.lastLogin,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }))
        });

    } catch (error) {
        console.error("Error fetching organization users:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching organization users"
        });
    }
});

// POST /api/org-users/create - Create a new user in an organization
router.post("/create", async (req, res) => {
    try {
        const {
            organization_id,
            name,
            email,
            password,
            role,
            permissions
        } = req.body;

        // Find organization
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password, // Note: Password should be hashed in the controller
            role: role || "employee",
            permissions: permissions || [],
            organization: organization._id,
            createdBy: req.user._id
        });

        // Add user to organization's employees array
        organization.employees.push(user._id);
        await organization.save();

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                permissions: user.permissions
            }
        });

    } catch (error) {
        console.error("Error creating organization user:", error);
        res.status(500).json({
            success: false,
            message: "Error creating organization user"
        });
    }
});

// POST /api/org-users/update - Update a user in an organization
router.post("/update", async (req, res) => {
    try {
        const {
            user_id,
            name,
            email,
            role,
            permissions,
            status
        } = req.body;

        // Find user
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (permissions) user.permissions = permissions;
        if (status) user.status = status;
        user.updatedBy = req.user._id;

        await user.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                permissions: user.permissions
            }
        });

    } catch (error) {
        console.error("Error updating organization user:", error);
        res.status(500).json({
            success: false,
            message: "Error updating organization user"
        });
    }
});

// POST /api/org-users/delete - Remove a user from an organization
router.post("/delete", async (req, res) => {
    try {
        const { user_id } = req.body;

        // Find user
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find organization
        const organization = await Organization.findOne({ _id: user.organization });
        if (organization) {
            // Remove user from organization's employees array
            organization.employees = organization.employees.filter(
                empId => empId.toString() !== user._id.toString()
            );
            await organization.save();
        }

        // Delete user
        await User.deleteOne({ _id: user._id });

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting organization user:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting organization user"
        });
    }
});

export default router; 