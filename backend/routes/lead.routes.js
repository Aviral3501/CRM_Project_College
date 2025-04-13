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
                status: lead.status,
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
        const { organization_id, user_id, ...leadData } = req.body;
        
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

        const lead = new Lead({
            ...leadData,
            organization: organization._id,
            createdBy: user._id,
            updatedBy: user._id
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
                status: populatedLead.status,
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
                status: lead.status,
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
        const { organization_id, lead_id } = req.body;
        
        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        const lead = await Lead.findOneAndDelete({
            lead_id,
            organization: organization._id
        });

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        // Delete any associated deals
        await Deal.deleteMany({ lead: lead._id });

        res.json({
            success: true,
            message: 'Lead deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 