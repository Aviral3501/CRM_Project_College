import express from 'express';
import { Lead } from '../models/lead.model.js';
import { Deal } from '../models/deal.model.js';
import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';

const router = express.Router();

console.log("Lead routes loaded"); // Debug log

// Get all leads for an organization
router.post('/get-leads', async (req, res) => {
    try {
        const { organization_id } = req.body;
        
        // First find the organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        const leads = await Lead.find({ organization: organization._id })
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: leads.map(lead => ({
                lead_id: lead.lead_id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone || '',
                company: lead.company || '',
                source: lead.source || '',
                status: lead.status,
                priority: lead.priority || 'medium',
                notes: lead.notes || '',
                tags: lead.tags || [],
                budget: lead.budget || 0,
                expectedCloseDate: lead.expectedCloseDate || null,
                assignedTo: lead.assignedTo?.name || 'Unassigned',
                createdAt: lead.createdAt,
                updatedAt: lead.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new lead
router.post('/create-lead', async (req, res) => {
    try {
        const { organization_id, user_id, assignedTo, ...leadData } = req.body;
        
        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Find user by user_id
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find assigned user if provided
        let assignedToUser = null;
        if (assignedTo) {
            assignedToUser = await User.findOne({ user_id: assignedTo });
            if (!assignedToUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Assigned user not found'
                });
            }
        }

        const lead = new Lead({
            ...leadData,
            organization: organization._id,
            createdBy: user._id,
            updatedBy: user._id,
            assignedTo: assignedToUser ? assignedToUser._id : null
        });

        await lead.save();

        // Populate the response
        const populatedLead = await Lead.findById(lead._id)
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: {
                lead_id: populatedLead.lead_id,
                name: populatedLead.name,
                email: populatedLead.email,
                phone: populatedLead.phone || '',
                company: populatedLead.company || '',
                source: populatedLead.source || '',
                status: populatedLead.status,
                priority: populatedLead.priority || 'medium',
                notes: populatedLead.notes || '',
                tags: populatedLead.tags || [],
                budget: populatedLead.budget || 0,
                expectedCloseDate: populatedLead.expectedCloseDate || null,
                assignedTo: populatedLead.assignedTo?.name || 'Unassigned',
                createdAt: populatedLead.createdAt,
                updatedAt: populatedLead.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update a lead
router.post('/update-lead', async (req, res) => {
    try {
        const { organization_id, user_id, lead_id, ...updateData } = req.body;
        
        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Find user by user_id
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const lead = await Lead.findOneAndUpdate(
            { lead_id, organization: organization._id },
            { 
                ...updateData,
                updatedBy: user._id
            },
            { new: true }
        )
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.json({
            success: true,
            data: {
                lead_id: lead.lead_id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone || '',
                company: lead.company || '',
                source: lead.source || '',
                status: lead.status,
                priority: lead.priority || 'medium',
                notes: lead.notes || '',
                tags: lead.tags || [],
                budget: lead.budget || 0,
                expectedCloseDate: lead.expectedCloseDate || null,
                assignedTo: lead.assignedTo?.name || 'Unassigned',
                createdAt: lead.createdAt,
                updatedAt: lead.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a lead
router.post('/delete-lead', async (req, res) => {
    try {
        const { organization_id, lead_ids } = req.body;
        
        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Convert single lead_id to array if needed
        const leadIdsArray = Array.isArray(lead_ids) ? lead_ids : [lead_ids];
        
        // Delete all leads with the provided lead_ids
        const result = await Lead.deleteMany({
            lead_id: { $in: leadIdsArray },
            organization: organization._id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No leads found to delete'
            });
        }

        res.json({
            success: true,
            message: `${result.deletedCount} lead(s) deleted successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 