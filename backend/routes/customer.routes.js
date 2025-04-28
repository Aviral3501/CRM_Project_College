import express from 'express';
import { Customer } from '../models/customer.model.js';
import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';
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

// Get all customers for an organization
router.post('/get-customers', validateIds, async (req, res) => {
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
        
        const customers = await Customer.find({ organization: organization._id })
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: customers.map(customer => ({
                customer_id: customer.customer_id,
                name: customer.name,
                contact: customer.contact,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                status: customer.status,
                totalValue: customer.totalValue,
                lastPurchase: customer.lastPurchase,
                notes: customer.notes,
                industry: customer.industry,
                companySize: customer.companySize,
                website: customer.website,
                socialMedia: customer.socialMedia,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get customer details including their quotes
router.post('/get-customer-details', validateIds, async (req, res) => {
    try {
        const { organization_id, customer_id } = req.body;
        
        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        const customer = await Customer.findOne({ 
            customer_id,
            organization: organization._id 
        })
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Get all quotes for this customer
        const quotes = await Quote.find({ 
            'client.email': customer.email,
            organization: organization._id 
        })
        .populate('pipeline', 'title amount')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                customer: {
                    customer_id: customer.customer_id,
                    name: customer.name,
                    contact: customer.contact,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    status: customer.status,
                    totalValue: customer.totalValue,
                    lastPurchase: customer.lastPurchase,
                    notes: customer.notes,
                    industry: customer.industry,
                    companySize: customer.companySize,
                    website: customer.website,
                    socialMedia: customer.socialMedia,
                    createdAt: customer.createdAt,
                    updatedAt: customer.updatedAt
                },
                quotes: quotes.map(quote => ({
                    quote_id: quote.quote_id,
                    title: quote.title,
                    amount: quote.amount,
                    status: quote.status,
                    pipeline: quote.pipeline ? {
                        title: quote.pipeline.title,
                        amount: quote.pipeline.amount
                    } : null,
                    assignedTo: quote.assignedTo?.name || 'Unassigned',
                    validUntil: quote.validUntil,
                    total: quote.total,
                    createdAt: quote.createdAt
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new customer
router.post('/create-customer', validateIds, async (req, res) => {
    try {
        const { organization_id, user_id, ...customerData } = req.body;
        
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

        const customer = new Customer({
            ...customerData,
            organization: organization._id,
            createdBy: user._id,
            updatedBy: user._id
        });

        await customer.save();

        // Populate the response
        const populatedCustomer = await Customer.findById(customer._id)
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: {
                customer_id: populatedCustomer.customer_id,
                name: populatedCustomer.name,
                contact: populatedCustomer.contact,
                email: populatedCustomer.email,
                phone: populatedCustomer.phone,
                address: populatedCustomer.address,
                status: populatedCustomer.status,
                totalValue: populatedCustomer.totalValue,
                lastPurchase: populatedCustomer.lastPurchase,
                notes: populatedCustomer.notes,
                industry: populatedCustomer.industry,
                companySize: populatedCustomer.companySize,
                website: populatedCustomer.website,
                socialMedia: populatedCustomer.socialMedia,
                createdAt: populatedCustomer.createdAt,
                updatedAt: populatedCustomer.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update a customer
router.post('/update-customer', validateIds, async (req, res) => {
    try {
        const { organization_id, user_id, customer_id, ...updateData } = req.body;
        
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

        const customer = await Customer.findOneAndUpdate(
            { customer_id, organization: organization._id },
            { 
                ...updateData,
                updatedBy: user._id
            },
            { new: true }
        )
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: {
                customer_id: customer.customer_id,
                name: customer.name,
                contact: customer.contact,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                status: customer.status,
                totalValue: customer.totalValue,
                lastPurchase: customer.lastPurchase,
                notes: customer.notes,
                industry: customer.industry,
                companySize: customer.companySize,
                website: customer.website,
                socialMedia: customer.socialMedia,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a customer
router.post('/delete-customer', validateIds, async (req, res) => {
    try {
        const { organization_id, customer_id } = req.body;
        
        // Find organization by org_id
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        const customer = await Customer.findOneAndDelete({
            customer_id,
            organization: organization._id
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 