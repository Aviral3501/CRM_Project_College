import mongoose from "mongoose";
import Counter from "./counter.model.js"; // Import the Counter model

const dealSchema = new mongoose.Schema(
	{
		deal_id: { type: String, unique: true }, // Custom ID for the deal
		title: { type: String, required: true },
		amount: { type: Number, required: true },
		stage: { type: String, enum: ["Proposal", "Negotiation", "Closed Won", "Closed Lost"], default: "Proposal" },
		lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

// Middleware to generate deal_id
dealSchema.pre("save", async function (next) {
	if (this.isNew) {
		const counter = await Counter.findOneAndUpdate(
			{ _id: "dealId" }, // Use a fixed ID for the deal counter
			{ $inc: { sequenceValue: 1 } },
			{ new: true, upsert: true }
		);
		this.deal_id = `DEA${String(counter.sequenceValue).padStart(9, '0')}`; // Format the ID to 12 characters
	}
	next();
});

export const Deal = mongoose.model("Deal", dealSchema);