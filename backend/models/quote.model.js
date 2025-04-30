import mongoose from "mongoose";
import Counter from "./counter.model.js";

const quoteSchema = new mongoose.Schema(
	{
		quote_id: { type: String, unique: true },
		title: { type: String, required: true },
		amount: { type: Number, required: true },
		status: { 
			type: String, 
			enum: ["Draft", "Pending", "Accepted", "Declined", "Expired"], 
			default: "Draft" 
		},
		pipeline: { type: mongoose.Schema.Types.ObjectId, ref: "Pipeline" },
		client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		validUntil: { type: Date, required: true },
		notes: { type: String },
		items: [{ 
			name: { type: String, required: true },
			description: { type: String },
			quantity: { type: Number, required: true },
			price: { type: Number, required: true },
			total: { type: Number }
		}],
		terms: { type: String },
		discount: { type: Number, default: 0 },
		tax: { type: Number, default: 0 },
		total: { type: Number },
		// Additional client information for the quote receipt
		clientInfo: {
			name: { type: String },
			company: { type: String },
			email: { type: String },
			phone: { type: String },
			address: {
				street: { type: String },
				city: { type: String },
				state: { type: String },
				country: { type: String },
				zipCode: { type: String }
			},
			industry: { type: String },
			website: { type: String },
			taxId: { type: String },
			registrationNumber: { type: String }
		},
		// Billing information
		billingInfo: {
			name: { type: String },
			company: { type: String },
			address: {
				street: { type: String },
				city: { type: String },
				state: { type: String },
				country: { type: String },
				zipCode: { type: String }
			},
			email: { type: String },
			phone: { type: String },
			taxExempt: { type: Boolean, default: false },
			paymentTerms: { type: String },
			preferredPaymentMethod: { type: String }
		},
		// Additional quote details
		currency: { type: String, default: "USD" },
		paymentDueDate: { type: Date },
		shippingAddress: {
			street: { type: String },
			city: { type: String },
			state: { type: String },
			country: { type: String },
			zipCode: { type: String }
		},
		shippingMethod: { type: String },
		shippingCost: { type: Number, default: 0 },
		shippingNotes: { type: String }
	},
	{ timestamps: true }
);

// Middleware to generate quote_id
quoteSchema.pre("save", async function (next) {
	if (this.isNew) {
		const counter = await Counter.findOneAndUpdate(
			{ _id: "quoteId" },
			{ $inc: { sequenceValue: 1 } },
			{ new: true, upsert: true }
		);
		this.quote_id = `QT${String(counter.sequenceValue).padStart(9, '0')}`;
	}
	next();
});

export const Quote = mongoose.model("Quote", quoteSchema); 