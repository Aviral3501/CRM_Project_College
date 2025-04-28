import mongoose from "mongoose";
import  Counter  from "./counter.model.js";

const clientSchema = new mongoose.Schema(
    {
        client_id: {
            type: String,
            unique: true,
            required: false
        },
        name: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        },
        industry: String,
        website: String,
        status: {
            type: String,
            enum: ['prospect', 'active', 'inactive'],
            default: 'prospect'
        },
        // New fields for comprehensive client information
        businessDetails: {
            companySize: String,
            annualRevenue: Number,
            fiscalYearEnd: Date,
            taxId: String,
            registrationNumber: String
        },
        contacts: [{
            name: String,
            position: String,
            email: String,
            phone: String,
            isPrimary: Boolean
        }],
        preferences: {
            preferredContactMethod: {
                type: String,
                enum: ['email', 'phone', 'in-person']
            },
            preferredLanguage: String,
            timezone: String,
            communicationFrequency: {
                type: String,
                enum: ['daily', 'weekly', 'monthly', 'quarterly']
            }
        },
        financialInfo: {
            creditLimit: Number,
            paymentTerms: String,
            preferredPaymentMethod: String,
            taxExempt: Boolean,
            billingAddress: {
                street: String,
                city: String,
                state: String,
                country: String,
                zipCode: String
            }
        },
        relationshipInfo: {
            clientSince: Date,
            lastContactDate: Date,
            nextFollowUpDate: Date,
            assignedAccountManager: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            priority: {
                type: String,
                enum: ['low', 'medium', 'high', 'vip'],
                default: 'medium'
            }
        },
        dealHistory: [{
            deal_id: String,
            title: String,
            amount: Number,
            status: String,
            closeDate: Date,
            products: [{
                name: String,
                quantity: Number,
                price: Number
            }]
        }],
        communicationHistory: [{
            date: Date,
            type: {
                type: String,
                enum: ['email', 'call', 'meeting', 'note']
            },
            summary: String,
            details: String,
            initiatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        documents: [{
            name: String,
            type: String,
            url: String,
            uploadDate: Date,
            uploadedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        notes: String,
        tags: [String]
    },
    { timestamps: true }
);

// Middleware to generate client_id
clientSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: "clientId" },
                { $inc: { sequenceValue: 1 } },
                { new: true, upsert: true }
            );
            this.client_id = `CLT${String(counter.sequenceValue).padStart(9, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

export const Client = mongoose.model("Client", clientSchema); 