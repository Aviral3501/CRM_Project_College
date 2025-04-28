import express from 'express';
import { Client } from '../models/client.model.js';
import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/client-documents')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

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
            .populate('createdBy', 'name user_id')
            .populate('updatedBy', 'name user_id')
            .populate('relationshipInfo.assignedAccountManager', 'name user_id')
            .sort({ createdAt: -1 });

        // Transform the response to include user_id instead of _id
        const transformedClients = clients.map(client => {
            const clientObj = client.toObject();
            
            // Replace createdBy _id with user_id
            if (clientObj.createdBy && clientObj.createdBy.user_id) {
                clientObj.createdBy = {
                    name: clientObj.createdBy.name,
                    user_id: clientObj.createdBy.user_id
                };
            }
            
            // Replace updatedBy _id with user_id
            if (clientObj.updatedBy && clientObj.updatedBy.user_id) {
                clientObj.updatedBy = {
                    name: clientObj.updatedBy.name,
                    user_id: clientObj.updatedBy.user_id
                };
            }
            
            // Replace assignedAccountManager _id with user_id
            if (clientObj.relationshipInfo && 
                clientObj.relationshipInfo.assignedAccountManager && 
                clientObj.relationshipInfo.assignedAccountManager.user_id) {
                clientObj.relationshipInfo.assignedAccountManager = {
                    name: clientObj.relationshipInfo.assignedAccountManager.name,
                    user_id: clientObj.relationshipInfo.assignedAccountManager.user_id
                };
            }
            
            // Add organization_id to the response
            clientObj.organization_id = req.organization.org_id;
            
            return clientObj;
        });

        res.json({
            success: true,
            data: transformedClients
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
        // Remove assignedAccountManager from relationshipInfo if it's empty
        const clientData = { ...req.body };
        if (clientData.relationshipInfo && clientData.relationshipInfo.assignedAccountManager === '') {
            delete clientData.relationshipInfo.assignedAccountManager;
        }

        const client = new Client({
            ...clientData,
            organization: req.organization._id,
            createdBy: req.user._id,
            updatedBy: req.user._id,
            relationshipInfo: {
                ...clientData.relationshipInfo,
                clientSince: new Date(),
                lastContactDate: new Date()
            }
        });

        await client.save();

        // Populate the response
        const populatedClient = await Client.findById(client._id)
            .populate('createdBy', 'name user_id')
            .populate('updatedBy', 'name user_id')
            .populate('relationshipInfo.assignedAccountManager', 'name user_id');
            
        // Transform the response to include user_id instead of _id
        const clientObj = populatedClient.toObject();
        
        // Replace createdBy _id with user_id
        if (clientObj.createdBy && clientObj.createdBy.user_id) {
            clientObj.createdBy = {
                name: clientObj.createdBy.name,
                user_id: clientObj.createdBy.user_id
            };
        }
        
        // Replace updatedBy _id with user_id
        if (clientObj.updatedBy && clientObj.updatedBy.user_id) {
            clientObj.updatedBy = {
                name: clientObj.updatedBy.name,
                user_id: clientObj.updatedBy.user_id
            };
        }
        
        // Replace assignedAccountManager _id with user_id
        if (clientObj.relationshipInfo && 
            clientObj.relationshipInfo.assignedAccountManager && 
            clientObj.relationshipInfo.assignedAccountManager.user_id) {
            clientObj.relationshipInfo.assignedAccountManager = {
                name: clientObj.relationshipInfo.assignedAccountManager.name,
                user_id: clientObj.relationshipInfo.assignedAccountManager.user_id
            };
        }
        
        // Add organization_id to the response
        clientObj.organization_id = req.organization.org_id;

        res.json({
            success: true,
            data: clientObj
        });
    } catch (error) {
        // Check for duplicate email error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({
                success: false,
                message: "A client with this email already exists"
            });
        }
        
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
        .populate('createdBy', 'name user_id')
        .populate('updatedBy', 'name user_id')
        .populate('relationshipInfo.assignedAccountManager', 'name user_id');

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }
        
        // Transform the response to include user_id instead of _id
        const clientObj = client.toObject();
        
        // Replace createdBy _id with user_id
        if (clientObj.createdBy && clientObj.createdBy.user_id) {
            clientObj.createdBy = {
                name: clientObj.createdBy.name,
                user_id: clientObj.createdBy.user_id
            };
        }
        
        // Replace updatedBy _id with user_id
        if (clientObj.updatedBy && clientObj.updatedBy.user_id) {
            clientObj.updatedBy = {
                name: clientObj.updatedBy.name,
                user_id: clientObj.updatedBy.user_id
            };
        }
        
        // Replace assignedAccountManager _id with user_id
        if (clientObj.relationshipInfo && 
            clientObj.relationshipInfo.assignedAccountManager && 
            clientObj.relationshipInfo.assignedAccountManager.user_id) {
            clientObj.relationshipInfo.assignedAccountManager = {
                name: clientObj.relationshipInfo.assignedAccountManager.name,
                user_id: clientObj.relationshipInfo.assignedAccountManager.user_id
            };
        }
        
        // Add organization_id to the response
        clientObj.organization_id = req.organization.org_id;

        res.json({
            success: true,
            data: clientObj
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add communication history
router.post('/add-communication', validateIds, async (req, res) => {
    try {
        const { client_id, type, summary, details } = req.body;

        const client = await Client.findOneAndUpdate(
            { client_id, organization: req.organization._id },
            {
                $push: {
                    communicationHistory: {
                        date: new Date(),
                        type,
                        summary,
                        details,
                        initiatedBy: req.user._id
                    }
                },
                $set: {
                    'relationshipInfo.lastContactDate': new Date(),
                    updatedBy: req.user._id
                }
            },
            { new: true }
        )
        .populate('communicationHistory.initiatedBy', 'name')
        .populate('relationshipInfo.assignedAccountManager', 'name');

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.json({
            success: true,
            data: {
                communicationHistory: client.communicationHistory,
                lastContactDate: client.relationshipInfo.lastContactDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Upload document
router.post('/upload-document', [validateIds, upload.single('document')], async (req, res) => {
    try {
        const { client_id } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const client = await Client.findOneAndUpdate(
            { client_id, organization: req.organization._id },
            {
                $push: {
                    documents: {
                        name: req.file.originalname,
                        type: path.extname(req.file.originalname),
                        url: req.file.path,
                        uploadDate: new Date(),
                        uploadedBy: req.user._id
                    }
                },
                updatedBy: req.user._id
            },
            { new: true }
        )
        .populate('documents.uploadedBy', 'name');

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.json({
            success: true,
            data: {
                documents: client.documents
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete document
router.post('/delete-document', validateIds, async (req, res) => {
    try {
        const { client_id, document_id } = req.body;

        const client = await Client.findOneAndUpdate(
            { client_id, organization: req.organization._id },
            {
                $pull: {
                    documents: { _id: document_id }
                },
                updatedBy: req.user._id
            },
            { new: true }
        );

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.json({
            success: true,
            data: {
                documents: client.documents
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