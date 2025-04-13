import express from 'express';
import { Client } from '../models/client.model.js';
import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';

const router = express.Router();

// Validate organization_id and user_id
const validateIds = async (req, res, next) => {
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
};

// Get all clients for an organization
router.post('/get-clients', validateIds, async (req, res) => {
    try {
        const clients = await Client.find({ organization: req.organization._id })
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: clients.map(client => ({
                client_id: client.client_id,
                name: client.name,
                company: client.company,
                email: client.email,
                phone: client.phone,
                address: client.address,
                industry: client.industry,
                website: client.website,
                status: client.status,
                notes: client.notes,
                tags: client.tags,
                createdAt: client.createdAt,
                updatedAt: client.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new client
router.post('/create-client', validateIds, async (req, res) => {
    try {
        const client = new Client({
            ...req.body,
            organization: req.organization._id,
            createdBy: req.user._id,
            updatedBy: req.user._id
        });

        await client.save();

        // Populate the response
        const populatedClient = await Client.findById(client._id)
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: {
                client_id: populatedClient.client_id,
                name: populatedClient.name,
                company: populatedClient.company,
                email: populatedClient.email,
                phone: populatedClient.phone,
                address: populatedClient.address,
                industry: populatedClient.industry,
                website: populatedClient.website,
                status: populatedClient.status,
                notes: populatedClient.notes,
                tags: populatedClient.tags,
                createdAt: populatedClient.createdAt,
                updatedAt: populatedClient.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update a client
router.post('/update-client', validateIds, async (req, res) => {
    try {
        const { client_id, ...updateData } = req.body;

        const client = await Client.findOneAndUpdate(
            { client_id, organization: req.organization._id },
            {
                ...updateData,
                updatedBy: req.user._id
            },
            { new: true }
        )
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.json({
            success: true,
            data: {
                client_id: client.client_id,
                name: client.name,
                company: client.company,
                email: client.email,
                phone: client.phone,
                address: client.address,
                industry: client.industry,
                website: client.website,
                status: client.status,
                notes: client.notes,
                tags: client.tags,
                createdAt: client.createdAt,
                updatedAt: client.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a client
router.post('/delete-client', validateIds, async (req, res) => {
    try {
        const { client_id } = req.body;

        const client = await Client.findOneAndDelete({
            client_id,
            organization: req.organization._id
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.json({
            success: true,
            message: 'Client deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 