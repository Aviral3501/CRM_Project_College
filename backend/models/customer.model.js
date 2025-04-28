import mongoose from "mongoose";
import Counter from "./counter.model.js";

const customerSchema = new mongoose.Schema(
	{
		customer_id: { type: String, unique: true },
		name: { type: String, required: true },
		contact: { type: String },
		email: { type: String, required: true },
		phone: { type: String },
		address: { type: String },
		status: { 
			type: String, 
			enum: ["Active", "Inactive"], 
			default: "Active" 
		},
		organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		totalValue: { type: Number, default: 0 },
		lastPurchase: { type: Date },
		notes: { type: String },
		industry: { type: String },
		companySize: { type: String },
		website: { type: String },
		socialMedia: {
			linkedin: { type: String },
			twitter: { type: String },
			facebook: { type: String }
		}
	},
	{ timestamps: true }
);

// Middleware to generate customer_id
customerSchema.pre("save", async function (next) {
	if (this.isNew) {
		const counter = await Counter.findOneAndUpdate(
			{ _id: "customerId" },
			{ $inc: { sequenceValue: 1 } },
			{ new: true, upsert: true }
		);
		this.customer_id = `CUS${String(counter.sequenceValue).padStart(9, '0')}`;
	}
	next();
});

export const Customer = mongoose.model("Customer", customerSchema); 