import express from 'express';
import { Lead } from '../models/lead.model.js';
import { Deal } from '../models/deal.model.js';

const router = express.Router();

console.log("Lead routes loaded"); // Debug log

// Get all leads for an organization
router.post('/get-leads', async (req, res) => {
    try {
        const { organization_id } = req.body;
        
        const leads = await Lead.find({ organization: organization_id })
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
        
        const lead = new Lead({
            ...leadData,
            organization: organization_id,
            createdBy: user_id,
            updatedBy: user_id
        });

        await lead.save();

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

// Update a lead
router.post('/update-lead', async (req, res) => {
    try {
        const { organization_id, user_id, lead_id, ...updateData } = req.body;
        
        const lead = await Lead.findOneAndUpdate(
            { lead_id, organization: organization_id },
            { ...updateData, updatedBy: user_id },
            { new: true }
        ).populate('assignedTo', 'name');

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
        
        const lead = await Lead.findOneAndDelete({
            lead_id,
            organization: organization_id
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