import mongoose from "mongoose";
import Counter from "./counter.model.js";

const quoteSchema = new mongoose.Schema(
	{
		quote_id: { type: String, unique: true },
		title: { type: String, required: true },
		amount: { type: Number, required: true },
		status: { 
			type: String, 
			enum: ["Pending", "Accepted", "Declined", "Expired"], 
			default: "Pending" 
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
		total: { type: Number }
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