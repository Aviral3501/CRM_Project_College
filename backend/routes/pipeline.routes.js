import express from 'express';
import { Deal } from '../models/deal.model.js';
import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';
import { Client } from '../models/client.model.js';

const router = express.Router();

// Get all deals for an organization with pipeline stages
router.post('/get-pipeline', async (req, res) => {
    try {
        const { organization_id } = req.body;
        
        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        const deals = await Deal.find({ organization: organization._id })
            .populate('lead', 'name email')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        // Group deals by stage
        const pipeline = {
            'Proposal': [],
            'Negotiation': [],
            'Closed Won': [],
            'Closed Lost': []
        };

        deals.forEach(deal => {
            const formattedDeal = {
                deal_id: deal.deal_id,
                title: deal.title,
                amount: deal.amount,
                stage: deal.stage,
                lead: {
                    name: deal.lead?.name || 'N/A',
                    email: deal.lead?.email || 'N/A'
                },
                assignedTo: deal.assignedTo?.name || 'Unassigned',
                createdAt: deal.createdAt,
                updatedAt: deal.updatedAt
            };

            pipeline[deal.stage].push(formattedDeal);
        });

        res.json({
            success: true,
            data: pipeline
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new deal in pipeline
router.post('/create-pipeline', async (req, res) => {
    try {
        const { organization_id, user_id, ...dealData } = req.body;
        
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

        // Find client by client_id if provided
        let client = null;
        if (dealData.client_id) {
            client = await Client.findOne({ client_id: dealData.client_id });
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }
        }

        const deal = new Deal({
            ...dealData,
            organization: organization._id,
            createdBy: user._id,
            updatedBy: user._id,
            client: client?._id
        });

        await deal.save();

        // Populate the response
        const populatedDeal = await Deal.findById(deal._id)
            .populate('lead', 'name email')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name')
            .populate('client', 'name company');

        res.json({
            success: true,
            data: {
                deal_id: populatedDeal.deal_id,
                title: populatedDeal.title,
                amount: populatedDeal.amount,
                stage: populatedDeal.stage,
                lead: {
                    name: populatedDeal.lead?.name || 'N/A',
                    email: populatedDeal.lead?.email || 'N/A'
                },
                client: {
                    name: populatedDeal.client?.name || 'N/A',
                    company: populatedDeal.client?.company || 'N/A'
                },
                assignedTo: populatedDeal.assignedTo?.name || 'Unassigned',
                createdAt: populatedDeal.createdAt,
                updatedAt: populatedDeal.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update a deal in pipeline
router.post('/update-pipeline', async (req, res) => {
    try {
        const { organization_id, user_id, deal_id, ...updateData } = req.body;
        
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

        // Find client by client_id if provided
        if (updateData.client_id) {
            const client = await Client.findOne({ client_id: updateData.client_id });
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }
            updateData.client = client._id;
            delete updateData.client_id;
        }

        const deal = await Deal.findOneAndUpdate(
            { deal_id, organization: organization._id },
            { 
                ...updateData,
                updatedBy: user._id
            },
            { new: true }
        )
        .populate('lead', 'name email')
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .populate('client', 'name company');

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
                    name: deal.lead?.name || 'N/A',
                    email: deal.lead?.email || 'N/A'
                },
                client: {
                    name: deal.client?.name || 'N/A',
                    company: deal.client?.company || 'N/A'
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

// Delete a deal from pipeline
router.post('/delete-pipeline', async (req, res) => {
    try {
        const { organization_id, deal_id } = req.body;
        
        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        const deal = await Deal.findOneAndDelete({
            deal_id,
            organization: organization._id
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