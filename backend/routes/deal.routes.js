import express from 'express';
import { Deal } from '../models/deal.model.js';
import { Lead } from '../models/lead.model.js';

const router = express.Router();

// Get all deals for an organization
router.post('/get-deals', async (req, res) => {
    try {
        const { organization_id } = req.body;
        
        const deals = await Deal.find({ organization: organization_id })
            .populate('lead', 'name email')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: deals.map(deal => ({
                deal_id: deal.deal_id,
                title: deal.title,
                amount: deal.amount,
                stage: deal.stage,
                lead: {
                    name: deal.lead?.name || 'Unknown',
                    email: deal.lead?.email || ''
                },
                assignedTo: deal.assignedTo?.name || 'Unassigned',
                createdAt: deal.createdAt,
                updatedAt: deal.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new deal
router.post('/create-deal', async (req, res) => {
    try {
        const { organization_id, user_id, ...dealData } = req.body;
        
        const deal = new Deal({
            ...dealData,
            organization: organization_id,
            createdBy: user_id,
            updatedBy: user_id
        });

        await deal.save();

        res.json({
            success: true,
            data: {
                deal_id: deal.deal_id,
                title: deal.title,
                amount: deal.amount,
                stage: deal.stage,
                lead: {
                    name: deal.lead?.name || 'Unknown',
                    email: deal.lead?.email || ''
                },
                assignedTo: deal.assignedTo?.name || 'Unassigned',
                createdAt: deal.createdAt,
                updatedAt: deal.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update a deal
router.post('/update-deal', async (req, res) => {
    try {
        const { organization_id, user_id, deal_id, ...updateData } = req.body;
        
        const deal = await Deal.findOneAndUpdate(
            { deal_id, organization: organization_id },
            { ...updateData, updatedBy: user_id },
            { new: true }
        ).populate('lead', 'name email')
         .populate('assignedTo', 'name');

        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        res.json({
            success: true,
            data: {
                deal_id: deal.deal_id,
                title: deal.title,
                amount: deal.amount,
                stage: deal.stage,
                lead: {
                    name: deal.lead?.name || 'Unknown',
                    email: deal.lead?.email || ''
                },
                assignedTo: deal.assignedTo?.name || 'Unassigned',
                createdAt: deal.createdAt,
                updatedAt: deal.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a deal
router.post('/delete-deal', async (req, res) => {
    try {
        const { organization_id, deal_id } = req.body;
        
        const deal = await Deal.findOneAndDelete({
            deal_id,
            organization: organization_id
        });

        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        res.json({
            success: true,
            message: 'Deal deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 