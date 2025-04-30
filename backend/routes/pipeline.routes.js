import express from 'express';
import { Pipeline } from '../models/pipeline.model.js';
import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';
import { Lead } from '../models/lead.model.js';
import { Quote } from '../models/quote.model.js';
import { protectRoute } from '../middleware/protectRoute.js';
import { Client } from '../models/client.model.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protectRoute);

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

// Get all pipeline deals for an organization
router.post('/get-pipeline', validateIds, async (req, res) => {
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
        
        const pipeline = await Pipeline.find({ organization: organization._id })
            .populate('lead', 'name email company')
            .populate('client', 'client_id name email company')
            .populate('assignedTo', 'name user_id')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: pipeline.map(deal => ({
                pipeline_id: deal.pipeline_id,
                title: deal.title,
                amount: deal.amount,
                stage: deal.stage,
                lead: deal.lead ? {
                    name: deal.lead.name,
                    email: deal.lead.email,
                    company: deal.lead.company
                } : null,
                client: deal.client ? {
                    client_id: deal.client.client_id,
                    name: deal.client.name,
                    email: deal.client.email,
                    company: deal.client.company
                } : null,
                assignedTo: deal.assignedTo?.name || 'Unassigned',
                client_id:deal.client ? deal.client.client_id : null,
                assignedToId: deal.assignedTo?.user_id || null,
                expectedCloseDate: deal.expectedCloseDate,
                notes: deal.notes,
                probability: deal.probability,
                products: deal.products,
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

// Create a new pipeline deal
router.post('/create-pipeline', validateIds, async (req, res) => {
    try {
        const { organization_id, user_id, lead_id, assignedTo, ...pipelineData } = req.body;
        
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

        // Find lead by lead_id if provided
        let lead = null;
        if (lead_id) {
            lead = await Lead.findOne({ lead_id });
            if (!lead) {
                return res.status(404).json({
                    success: false,
                    message: 'Lead not found'
                });
            }
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

        const pipeline = new Pipeline({
            ...pipelineData,
            organization: organization._id,
            createdBy: user._id,
            updatedBy: user._id,
            lead: lead ? lead._id : null,
            assignedTo: assignedToUser ? assignedToUser._id : null
        });

        await pipeline.save();

        // Populate the response
        const populatedPipeline = await Pipeline.findById(pipeline._id)
            .populate('lead', 'name email company')
            .populate('client', 'name email company')
            .populate('assignedTo', 'name user_id')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: {
                pipeline_id: populatedPipeline.pipeline_id,
                title: populatedPipeline.title,
                amount: populatedPipeline.amount,
                stage: populatedPipeline.stage,
                lead: populatedPipeline.lead ? {
                    name: populatedPipeline.lead.name,
                    email: populatedPipeline.lead.email,
                    company: populatedPipeline.lead.company
                } : null,
                client: populatedPipeline.client ? {
                    name: populatedPipeline.client.name,
                    email: populatedPipeline.client.email,
                    company: populatedPipeline.client.company
                } : null,
                assignedTo: populatedPipeline.assignedTo?.name || 'Unassigned',
                assignedToId: populatedPipeline.assignedTo?.user_id || null,
                expectedCloseDate: populatedPipeline.expectedCloseDate,
                notes: populatedPipeline.notes,
                probability: populatedPipeline.probability,
                products: populatedPipeline.products,
                createdAt: populatedPipeline.createdAt,
                updatedAt: populatedPipeline.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update a pipeline deal
router.post('/update-pipeline', validateIds, async (req, res) => {
    try {
        const { organization_id, user_id, pipeline_id, client_id, ...updateData } = req.body;
        
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

        // If client_id is provided, look up the client
        let clientRef = undefined;
        if (client_id) {
            const client = await Client.findOne({ client_id });
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }
            clientRef = client._id;
        }

        const pipeline = await Pipeline.findOneAndUpdate(
            { pipeline_id, organization: organization._id },
            { 
                ...updateData,
                ...(clientRef && { client: clientRef }), // Only include client if we found one
                updatedBy: user._id
            },
            { new: true }
        )
        .populate('lead', 'name email company')
        .populate('client', 'client_id name email company')
        .populate('assignedTo', 'name user_id')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');

        if (!pipeline) {
            return res.status(404).json({
                success: false,
                message: 'Pipeline deal not found'
            });
        }

        // Create quote if pipeline is marked as won or lost
        if (pipeline.stage === "Closed Won" || pipeline.stage === "Closed Lost") {
            // Check if a quote already exists for this pipeline
            const existingQuote = await Quote.findOne({ pipeline: pipeline._id });
            
            let quote = existingQuote;
            if (!existingQuote) {
                // Create a new quote
                quote = new Quote({
                    title: `Quote for ${pipeline.title}`,
                    amount: pipeline.amount,
                    status: pipeline.stage === "Closed Won" ? "Accepted" : "Declined",
                    pipeline: pipeline._id,
                    client: pipeline.client,
                    assignedTo: pipeline.assignedTo,
                    organization: organization._id,
                    createdBy: user._id,
                    updatedBy: user._id,
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    items: pipeline.products?.map(product => ({
                        name: product.name,
                        quantity: product.quantity,
                        price: product.price,
                        total: product.quantity * product.price
                    })) || [],
                    total: pipeline.amount,
                    notes: pipeline.notes || ''
                });

                await quote.save();
            }

            // Include quote_id in the response
            responseData.quote_id = quote.quote_id;
        }

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a pipeline deal
router.post('/delete-pipeline', validateIds, async (req, res) => {
    try {
        const { organization_id, pipeline_id } = req.body;
        
        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        const pipeline = await Pipeline.findOneAndDelete({
            pipeline_id,
            organization: organization._id
        });

        if (!pipeline) {
            return res.status(404).json({
                success: false,
                message: 'Pipeline deal not found'
            });
        }

        res.json({
            success: true,
            message: 'Pipeline deal deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Generate pipeline deals from selected leads
router.post('/generate-pipeline-from-leads', validateIds, async (req, res) => {
    try {
        const { organization_id, user_id, lead_ids, stage, client_id } = req.body;

        // Validate input
        if (!organization_id || !user_id || !lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid input parameters"
            });
        }

        // Get organization and user using findOne instead of findById
        const organization = await Organization.findOne({ org_id: organization_id });
        const user = await User.findOne({ user_id: user_id });

        if (!organization || !user) {
            return res.status(404).json({
                success: false,
                message: "Organization or user not found"
            });
        }

        // Get leads
        const leads = await Lead.find({
            lead_id: { $in: lead_ids },
            organization: organization._id
        });

        if (!leads || leads.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No leads found"
            });
        }

        // Create pipeline deals for each lead
        const pipelinePromises = leads.map(async (lead) => {
            // Look up the client if client_id is provided or if lead has a client
            let clientRef = null;
            if (client_id) {
                const client = await Client.findOne({ client_id: client_id });
                if (client) {
                    clientRef = client._id;
                }
            } else if (lead.client?.client_id) {
                const client = await Client.findOne({ client_id: lead.client.client_id });
                if (client) {
                    clientRef = client._id;
                }
            }

            // Look up assigned user if present
            let assignedToRef = user._id; // default to current user
            if (lead.assignedTo) {
                const assignedUser = await User.findOne({ user_id: lead.assignedTo });
                if (assignedUser) {
                    assignedToRef = assignedUser._id;
                }
            }

            const pipelineDeal = new Pipeline({
                organization: organization._id,
                title: lead.name,
                description: lead.notes || '',
                stage: stage || 'Qualified',
                amount: lead.budget || 0,
                expectedCloseDate: lead.expectedCloseDate || new Date(),
                assignedTo: assignedToRef,
                client: clientRef, // Use the looked-up client reference
                createdBy: user._id,
                updatedBy: user._id,
                tags: lead.tags || [],
                priority: lead.priority || 'Medium',
                status: 'Active',
                probability: 50,
                products: [],
                notes: lead.notes || '',
                contact_info: {
                    email: lead.email || '',
                    phone: lead.phone || '',
                    company: lead.company || ''
                }
            });

            await pipelineDeal.save();
            return pipelineDeal;
        });

        await Promise.all(pipelinePromises);

        // Update leads status to 'Converted'
        await Lead.updateMany(
            { lead_id: { $in: lead_ids }, organization: organization._id },
            { $set: { status: 'Converted' } }
        );

        res.status(200).json({
            success: true,
            message: "Leads successfully converted to pipeline deals"
        });

    } catch (error) {
        console.error('Error in generate-pipeline-from-leads:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

export default router; 