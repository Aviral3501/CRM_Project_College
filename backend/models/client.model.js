import mongoose from "mongoose";
import  Counter  from "./counter.model.js";

const clientSchema = new mongoose.Schema(
    {
        client_id: { type: String, unique: true },
        name: { type: String, required: true },
        company: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
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
            enum: ["active", "inactive", "prospect"],
            default: "prospect"
        },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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