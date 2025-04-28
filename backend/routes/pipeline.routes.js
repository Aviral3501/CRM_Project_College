import express from 'express';
import { Pipeline } from '../models/pipeline.model.js';
import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';
import { Lead } from '../models/lead.model.js';
import { Quote } from '../models/quote.model.js';
import { protectRoute } from '../middleware/protectRoute.js';

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
            .populate('client', 'name email company')
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
                    name: deal.client.name,
                    email: deal.client.email,
                    company: deal.client.company
                } : null,
                assignedTo: deal.assignedTo?.name || 'Unassigned',
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
        const { organization_id, user_id, pipeline_id, ...updateData } = req.body;
        
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

        const pipeline = await Pipeline.findOneAndUpdate(
            { pipeline_id, organization: organization._id },
            { 
                ...updateData,
                updatedBy: user._id
            },
            { new: true }
        )
        .populate('lead', 'name email company')
        .populate('client', 'name email company')
        .populate('assignedTo', 'name user_id')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');

        if (!pipeline) {
            return res.status(404).json({
                success: false,
                message: 'Pipeline deal not found'
            });
        }

        // Check if the pipeline deal has reached the final stage (Negotiation)
        // If so, create a quote automatically
        if (pipeline.stage === "Negotiation") {
            // Check if a quote already exists for this pipeline
            const existingQuote = await Quote.findOne({ pipeline: pipeline._id });
            
            if (!existingQuote) {
                // Create a new quote
                const quote = new Quote({
                    title: `Quote for ${pipeline.title}`,
                    amount: pipeline.amount,
                    status: "Pending",
                    pipeline: pipeline._id,
                    client: pipeline.client,
                    assignedTo: pipeline.assignedTo,
                    organization: organization._id,
                    createdBy: user._id,
                    updatedBy: user._id,
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    items: pipeline.products.map(product => ({
                        name: product.name,
                        quantity: product.quantity,
                        price: product.price,
                        total: product.quantity * product.price
                    })),
                    total: pipeline.amount
                });

                await quote.save();
            }
        }

        res.json({
            success: true,
            data: {
                pipeline_id: pipeline.pipeline_id,
                title: pipeline.title,
                amount: pipeline.amount,
                stage: pipeline.stage,
                lead: pipeline.lead ? {
                    name: pipeline.lead.name,
                    email: pipeline.lead.email,
                    company: pipeline.lead.company
                } : null,
                client: pipeline.client ? {
                    name: pipeline.client.name,
                    email: pipeline.client.email,
                    company: pipeline.client.company
                } : null,
                assignedTo: pipeline.assignedTo?.name || 'Unassigned',
                assignedToId: pipeline.assignedTo?.user_id || null,
                expectedCloseDate: pipeline.expectedCloseDate,
                notes: pipeline.notes,
                probability: pipeline.probability,
                products: pipeline.products,
                createdAt: pipeline.createdAt,
                updatedAt: pipeline.updatedAt
            }
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
        const { organization_id, user_id, lead_ids } = req.body;
        
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

        // Convert single lead_id to array if needed
        const leadIdsArray = Array.isArray(lead_ids) ? lead_ids : [lead_ids];
        
        // Find all leads with the provided lead_ids
        const leads = await Lead.find({
            lead_id: { $in: leadIdsArray },
            organization: organization._id
        });

        if (leads.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No leads found to convert'
            });
        }

        // Create pipeline deals for each lead
        const createdPipelines = [];
        
        for (const lead of leads) {
            // Check if a pipeline already exists for this lead
            const existingPipeline = await Pipeline.findOne({ lead: lead._id });
            
            if (existingPipeline) {
                // Skip if pipeline already exists
                continue;
            }

            // Determine initial stage based on lead status
            // Use provided stage if present, otherwise fallback to old logic
            let initialStage = req.body.stage || "Proposal";
            if (!req.body.stage) {
                if (lead.status === "Qualified") {
                    initialStage = "Negotiation";
                } else if (lead.status === "Lost") {
                    initialStage = "Closed Lost";
                }
            }

            // Create a new pipeline deal
            const pipeline = new Pipeline({
                title: `${lead.company || 'Unknown Company'} - ${lead.name}`,
                amount: lead.budget || 0,
                stage: initialStage,
                lead: lead._id,
                assignedTo: lead.assignedTo,
                organization: organization._id,
                createdBy: user._id,
                updatedBy: user._id,
                expectedCloseDate: lead.expectedCloseDate,
                notes: lead.notes,
                probability: lead.status === "Qualified" ? 70 : 30,
                products: [] // Empty products array initially
            });

            await pipeline.save();
            
            // Populate the response
            const populatedPipeline = await Pipeline.findById(pipeline._id)
                .populate('lead', 'name email company')
                .populate('client', 'name email company')
                .populate('assignedTo', 'name user_id')
                .populate('createdBy', 'name')
                .populate('updatedBy', 'name');
                
            createdPipelines.push({
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
            });
        }

        res.json({
            success: true,
            message: `${createdPipelines.length} pipeline deal(s) created successfully`,
            data: createdPipelines
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 