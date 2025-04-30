import express from 'express';
import { Quote } from '../models/quote.model.js';
import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';
import { Pipeline } from '../models/pipeline.model.js';
import { Customer } from '../models/customer.model.js';
import { Client } from '../models/client.model.js';
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

// Get all quotes for an organization
router.post('/get-quotes', validateIds, async (req, res) => {
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
        
        const quotes = await Quote.find({ organization: organization._id })
            .populate('pipeline', 'title amount')
            .populate('client', 'name email company')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: quotes.map(quote => ({
                quote_id: quote.quote_id,
                title: quote.title,
                amount: quote.amount,
                status: quote.status,
                pipeline: quote.pipeline ? {
                    title: quote.pipeline.title,
                    amount: quote.pipeline.amount
                } : null,
                client: quote.client ? {
                    name: quote.client.name,
                    email: quote.client.email,
                    company: quote.client.company
                } : null,
                assignedTo: quote.assignedTo?.name || 'Unassigned',
                validUntil: quote.validUntil,
                notes: quote.notes,
                items: quote.items,
                terms: quote.terms,
                discount: quote.discount,
                tax: quote.tax,
                total: quote.total,
                clientInfo: quote.clientInfo,
                billingInfo: quote.billingInfo,
                currency: quote.currency,
                paymentDueDate: quote.paymentDueDate,
                shippingAddress: quote.shippingAddress,
                shippingMethod: quote.shippingMethod,
                shippingCost: quote.shippingCost,
                shippingNotes: quote.shippingNotes,
                createdAt: quote.createdAt,
                updatedAt: quote.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new quote
router.post('/create-quote', validateIds, async (req, res) => {
    try {
        const { 
            organization_id, 
            user_id, 
            pipeline_id, 
            assignedTo, 
            title,
            client_id,
            validUntil,
            status,
            items,
            notes,
            terms,
            discount,
            tax,
            total,
            amount,
            clientInfo,
            billingInfo,
            currency,
            paymentDueDate,
            shippingAddress,
            shippingMethod,
            shippingCost,
            shippingNotes
        } = req.body;
        
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

        // Find pipeline by pipeline_id if provided
        let pipeline = null;
        if (pipeline_id) {
            pipeline = await Pipeline.findOne({ pipeline_id });
            if (!pipeline) {
                return res.status(404).json({
                    success: false,
                    message: 'Pipeline not found'
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

        // Find client if provided
        let client = null;
        if (client_id) {
            client = await Client.findOne({ client_id });
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }
        }

        // Calculate item totals
        const processedItems = items.map(item => {
            const itemTotal = item.quantity * item.price;
            return {
                ...item,
                total: itemTotal
            };
        });

        // Calculate final totals
        const subtotal = amount || processedItems.reduce((sum, item) => sum + item.total, 0);
        const discountAmount = (subtotal * (discount || 0)) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * (tax || 0)) / 100;
        const finalTotal = total || (afterDiscount + taxAmount + (shippingCost || 0));

        const quote = new Quote({
            title,
            amount: subtotal,
            status: status || 'Pending',
            pipeline: pipeline ? pipeline._id : null,
            client: client ? client._id : null,
            assignedTo: assignedToUser ? assignedToUser._id : null,
            organization: organization._id,
            createdBy: user._id,
            updatedBy: user._id,
            validUntil,
            notes,
            items: processedItems,
            terms,
            discount: discount || 0,
            tax: tax || 0,
            total: finalTotal,
            clientInfo: clientInfo || {},
            billingInfo: billingInfo || {},
            currency: currency || 'USD',
            paymentDueDate,
            shippingAddress: shippingAddress || {},
            shippingMethod: shippingMethod || '',
            shippingCost: Math.max(0, shippingCost || 0),
            shippingNotes: shippingNotes || ''
        });

        await quote.save();

        // Populate the response
        const populatedQuote = await Quote.findById(quote._id)
            .populate('pipeline', 'title amount')
            .populate('client', 'name email company')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: {
                quote_id: populatedQuote.quote_id,
                title: populatedQuote.title,
                amount: populatedQuote.amount,
                status: populatedQuote.status,
                pipeline: populatedQuote.pipeline ? {
                    title: populatedQuote.pipeline.title,
                    amount: populatedQuote.pipeline.amount
                } : null,
                client: populatedQuote.client ? {
                    name: populatedQuote.client.name,
                    email: populatedQuote.client.email,
                    company: populatedQuote.client.company
                } : null,
                assignedTo: populatedQuote.assignedTo?.name || 'Unassigned',
                validUntil: populatedQuote.validUntil,
                notes: populatedQuote.notes,
                items: populatedQuote.items,
                terms: populatedQuote.terms,
                discount: populatedQuote.discount,
                tax: populatedQuote.tax,
                total: populatedQuote.total,
                clientInfo: populatedQuote.clientInfo,
                billingInfo: populatedQuote.billingInfo,
                currency: populatedQuote.currency,
                paymentDueDate: populatedQuote.paymentDueDate,
                shippingAddress: populatedQuote.shippingAddress,
                shippingMethod: populatedQuote.shippingMethod,
                shippingCost: populatedQuote.shippingCost,
                shippingNotes: populatedQuote.shippingNotes,
                createdAt: populatedQuote.createdAt,
                updatedAt: populatedQuote.updatedAt
            }
        });
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update a quote
router.post('/update-quote', validateIds, async (req, res) => {
    try {
        const { 
            organization_id, 
            user_id, 
            quote_id, 
            title,
            client_id,
            validUntil,
            status,
            items,
            notes,
            terms,
            discount,
            tax,
            total,
            amount,
            clientInfo,
            billingInfo,
            currency,
            paymentDueDate,
            shippingAddress,
            shippingMethod,
            shippingCost,
            shippingNotes
        } = req.body;
        
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

        // Find client if provided
        let client = null;
        if (client_id) {
            client = await Client.findOne({ client_id });
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }
            
            // If clientInfo is not provided, populate it from the client
            if (!clientInfo && client) {
                clientInfo = {
                    name: client.name,
                    company: client.company,
                    email: client.email,
                    phone: client.phone,
                    address: client.address,
                    industry: client.industry,
                    website: client.website,
                    taxId: client.businessDetails?.taxId || '',
                    registrationNumber: client.businessDetails?.registrationNumber || ''
                };
            }
            
            // If billingInfo is not provided, populate it from the client
            if (!billingInfo && client) {
                billingInfo = {
                    name: client.name,
                    company: client.company,
                    address: client.financialInfo?.billingAddress || client.address,
                    email: client.email,
                    phone: client.phone,
                    taxExempt: client.financialInfo?.taxExempt || false,
                    paymentTerms: client.financialInfo?.paymentTerms || '',
                    preferredPaymentMethod: client.financialInfo?.preferredPaymentMethod || ''
                };
            }
        }

        // Calculate item totals
        const processedItems = items ? items.map(item => {
            const itemTotal = item.quantity * item.price;
            return {
                ...item,
                total: itemTotal
            };
        }) : undefined;

        // Calculate final totals if items are provided
        let updateData = {
            ...(title !== undefined && { title }),
            ...(client_id !== undefined && { client: client ? client._id : null }),
            ...(validUntil !== undefined && { validUntil }),
            ...(status !== undefined && { status }),
            ...(notes !== undefined && { notes }),
            ...(terms !== undefined && { terms }),
            ...(discount !== undefined && { discount }),
            ...(tax !== undefined && { tax }),
            ...(processedItems !== undefined && { items: processedItems }),
            ...(clientInfo !== undefined && { clientInfo }),
            ...(billingInfo !== undefined && { billingInfo }),
            ...(currency !== undefined && { currency }),
            ...(paymentDueDate !== undefined && { paymentDueDate }),
            ...(shippingAddress !== undefined && { shippingAddress }),
            ...(shippingMethod !== undefined && { shippingMethod }),
            ...(shippingCost !== undefined && { shippingCost }),
            ...(shippingNotes !== undefined && { shippingNotes }),
            updatedBy: user._id
        };

        // Calculate totals if items are provided
        if (processedItems) {
            const subtotal = amount || processedItems.reduce((sum, item) => sum + item.total, 0);
            const discountAmount = (subtotal * (discount || 0)) / 100;
            const afterDiscount = subtotal - discountAmount;
            const taxAmount = (afterDiscount * (tax || 0)) / 100;
            const finalTotal = total || (afterDiscount + taxAmount);
            
            updateData.amount = subtotal;
            updateData.total = finalTotal;
        }

        const quote = await Quote.findOneAndUpdate(
            { quote_id, organization: organization._id },
            updateData,
            { new: true }
        )
        .populate('pipeline', 'title amount')
        .populate('client', 'name email company')
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Check if the quote has been accepted
        // If so, create or update a customer record
        if (quote.status === "Accepted" && quote.client) {
            // Check if a customer already exists with this email
            const existingCustomer = await Customer.findOne({ 
                email: quote.client.email,
                organization: organization._id
            });
            
            if (existingCustomer) {
                // Update existing customer
                existingCustomer.totalValue += quote.total;
                existingCustomer.lastPurchase = new Date();
                existingCustomer.updatedBy = user._id;
                await existingCustomer.save();
            } else {
                // Create a new customer
                const customer = new Customer({
                    name: quote.client.name,
                    email: quote.client.email,
                    phone: quote.client.phone || '',
                    address: quote.client.address || '',
                    status: 'Active',
                    organization: organization._id,
                    createdBy: user._id,
                    updatedBy: user._id,
                    totalValue: quote.total,
                    lastPurchase: new Date()
                });

                await customer.save();
            }
        }

        res.json({
            success: true,
            data: {
                quote_id: quote.quote_id,
                title: quote.title,
                amount: quote.amount,
                status: quote.status,
                pipeline: quote.pipeline ? {
                    title: quote.pipeline.title,
                    amount: quote.pipeline.amount
                } : null,
                client: quote.client ? {
                    name: quote.client.name,
                    email: quote.client.email,
                    company: quote.client.company
                } : null,
                assignedTo: quote.assignedTo?.name || 'Unassigned',
                validUntil: quote.validUntil,
                notes: quote.notes,
                items: quote.items,
                terms: quote.terms,
                discount: quote.discount,
                tax: quote.tax,
                total: quote.total,
                clientInfo: quote.clientInfo,
                billingInfo: quote.billingInfo,
                currency: quote.currency,
                paymentDueDate: quote.paymentDueDate,
                shippingAddress: quote.shippingAddress,
                shippingMethod: quote.shippingMethod,
                shippingCost: quote.shippingCost,
                shippingNotes: quote.shippingNotes,
                createdAt: quote.createdAt,
                updatedAt: quote.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a quote
router.post('/delete-quote', validateIds, async (req, res) => {
    try {
        const { organization_id, quote_id } = req.body;
        
        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        const quote = await Quote.findOneAndDelete({
            quote_id,
            organization: organization._id
        });

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        res.json({
            success: true,
            message: 'Quote deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 