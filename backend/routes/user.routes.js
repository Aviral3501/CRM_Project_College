import express from 'express';
import { User } from '../models/user.model.js';
import { Organization } from '../models/org.model.js';

const router = express.Router();

// Get all users for an organization
router.post('/get-users', async (req, res) => {
    try {
        const { organization_id } = req.body;
        
        const users = await User.find({ organization: organization_id })
            .select('-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt')
            .populate('organization', 'name')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: users.map(user => ({
                id: user.user_id,
                name: user.name,
                role: user.role,
                department: user.department || 'Not Specified',
                email: user.email,
                phone: user.phone || '',
                location: user.location || '',
                status: user.status,
                performance: user.performance || 0,
                projects: user.projects || [],
                joinDate: user.createdAt.toISOString().split('T')[0],
                profileImage: user.profileImage
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new user
router.post('/create-user', async (req, res) => {
    try {
        const { organization_id, user_id, ...userData } = req.body;
        
        const user = new User({
            ...userData,
            organization: organization_id,
            createdBy: user_id,
            updatedBy: user_id
        });

        await user.save();

        res.json({
            success: true,
            data: {
                id: user.user_id,
                name: user.name,
                role: user.role,
                department: user.department || 'Not Specified',
                email: user.email,
                phone: user.phone || '',
                location: user.location || '',
                status: user.status,
                performance: user.performance || 0,
                projects: user.projects || [],
                joinDate: user.createdAt.toISOString().split('T')[0],
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update a user
router.post('/update-user', async (req, res) => {
    try {
        const { organization_id, user_id, target_user_id, ...updateData } = req.body;
        
        const user = await User.findOneAndUpdate(
            { user_id: target_user_id, organization: organization_id },
            { ...updateData, updatedBy: user_id },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.user_id,
                name: user.name,
                role: user.role,
                department: user.department || 'Not Specified',
                email: user.email,
                phone: user.phone || '',
                location: user.location || '',
                status: user.status,
                performance: user.performance || 0,
                projects: user.projects || [],
                joinDate: user.createdAt.toISOString().split('T')[0],
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a user
router.post('/delete-user', async (req, res) => {
    try {
        const { organization_id, target_user_id } = req.body;
        
        const user = await User.findOneAndDelete({
            user_id: target_user_id,
            organization: organization_id
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 