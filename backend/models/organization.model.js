import mongoose from "mongoose";
import  Counter  from "./counter.model.js";

// Check if the model already exists
const Organization = mongoose.models.Organization || mongoose.model("Organization", new mongoose.Schema(
    {
        org_id: { type: String, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        },
        website: String,
        industry: String,
        size: {
            type: String,
            enum: ["small", "medium", "large", "enterprise"],
            default: "small"
        },
        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active"
        },
        subscription: {
            type: String,
            enum: ["free", "basic", "premium", "enterprise"],
            default: "free"
        },
        subscriptionExpiry: Date,
        settings: {
            theme: { type: String, default: "light" },
            timezone: { type: String, default: "UTC" },
            language: { type: String, default: "en" }
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
));

// Add pre-save middleware
Organization.schema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: "orgId" },
                { $inc: { sequenceValue: 1 } },
                { new: true, upsert: true }
            );
            this.org_id = `ORG${String(counter.sequenceValue).padStart(9, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

export { Organization }; 