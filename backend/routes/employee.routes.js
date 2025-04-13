import express from "express";
import { User } from "../models/user.model.js";
import { Organization } from "../models/org.model.js";
import { protectRoute } from "../middleware/protectRoute.js";


const router = express.Router();

// All routes are protected and require authentication
router.use(protectRoute);


// Validate organization_id and user_id
const validateIds = async (req, res, next) => {
    try {
        const { organization_id, user_id } = req.body;
        
        if (!organization_id) {
            return res.status(400).json({
                success: false,
                message: "organization_id is required"
            });
        }
        
        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "user_id is required"
            });
        }

        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        // Find user by user_id
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Add organization and user to request
        req.organization = organization;
        req.user = user;
        
        next();
    } catch (error) {
        console.error("Error in validateIds middleware:", error);
        next(error);
    }
};


// Get all employees for an organization
router.post('/get-employees', validateIds, async (req, res) => {
    try {
        const employees = await User.find({ organization: req.organization._id })
            .select('-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt')
            .populate('organization', 'name industry');


        res.json({
            success: true,
            data: employees.map(employee => ({
                user_id: employee.user_id,
                name: employee.name,
                role: employee.role,
                department: employee.department || 'Not specified',
                email: employee.email,
                phone: employee.phone || 'Not specified',
                location: employee.location || 'Not specified',
                status: employee.status,
                performance: employee.performance || 0,
                projects: employee.projects || [],
                joinDate: employee.createdAt.toISOString().split('T')[0]
            }))
        });
    } catch (error) {
        console.error("Error in list employees:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new employee
router.post('/create-employee', validateIds, async (req, res) => {
    try {
        const {
            name,
            role,
            department,
            email,
            phone,
            location,
            password
        } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const employee = new User({
            name,
            role,
            department,
            email,
            phone,
            location,
            password,
            organization: req.organization._id,
            createdBy: req.user._id,
            updatedBy: req.user._id,
            status: 'active',
            performance: 0,
            projects: []
        });

        await employee.save();

        // Add employee to organization's employees array
        req.organization.employees.push(employee._id);
        await req.organization.save();

        res.json({
            success: true,
            data: {
                user_id: employee.user_id,
                name: employee.name,
                role: employee.role,
                department: employee.department,
                email: employee.email,
                phone: employee.phone,
                location: employee.location,
                status: employee.status,
                performance: employee.performance,
                projects: employee.projects,
                joinDate: employee.createdAt.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update an employee
router.post('/update-employee', validateIds, async (req, res) => {
    try {
        const { target_user_id, ...updateData } = req.body;
        
        if (!target_user_id) {
            return res.status(400).json({
                success: false,
                message: "target_user_id is required"
            });
        }

        // First, find the existing user
        const existingUser = await User.findOne({ 
            user_id: target_user_id, 
            organization: req.organization._id 
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Update only the allowed fields
        const allowedFields = ['name', 'department', 'phone', 'location', 'status', 'performance'];
        const updateFields = {};
        
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });

        // Add updatedBy field
        updateFields.updatedBy = req.user._id;

        const employee = await User.findOneAndUpdate(
            { user_id: target_user_id, organization: req.organization._id },
            { $set: updateFields },
            { new: true }
        );

        res.json({
            success: true,
            data: {
                user_id: employee.user_id,
                name: employee.name,
                role: employee.role,
                department: employee.department,
                email: employee.email,
                phone: employee.phone,
                location: employee.location,
                status: employee.status,
                performance: employee.performance,
                projects: employee.projects,
                joinDate: employee.createdAt.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete an employee
router.post('/delete-employee', validateIds, async (req, res) => {
    try {
        const { target_user_id } = req.body;
        
        if (!target_user_id) {
            return res.status(400).json({
                success: false,
                message: "target_user_id is required"
            });
        }

        const employee = await User.findOneAndDelete({
            user_id: target_user_id,
            organization: req.organization._id
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Remove employee from organization's employees array
        req.organization.employees = req.organization.employees.filter(
            empId => empId.toString() !== employee._id.toString()
        );
        await req.organization.save();

        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


export default router; 