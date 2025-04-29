import mongoose from "mongoose";
import Counter from "./counter.model.js"; // Import the Counter model

const leadSchema = new mongoose.Schema(
	{
		lead_id: { type: String, unique: true }, // Custom ID for the lead
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		phone: { type: String },
		company: { type: String },
		source: { type: String },
		status: { type: String, enum: ["New", "Contacted", "Qualified", "Lost"], default: "New" },
		priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
		notes: { type: String },
		tags: [{ type: String }],
		budget: { type: Number },
		expectedCloseDate: { type: Date },
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		client_id: { type: String }, // Add client_id field
		client: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Client'
		},
	},
	{ timestamps: true }
);

// Middleware to generate lead_id
leadSchema.pre("save", async function (next) {
	if (this.isNew) {
		const counter = await Counter.findOneAndUpdate(
			{ _id: "leadId" }, // Use a fixed ID for the lead counter
			{ $inc: { sequenceValue: 1 } },
			{ new: true, upsert: true }
		);
		this.lead_id = `LED${String(counter.sequenceValue).padStart(9, '0')}`; // Format the ID to 12 characters
	}
	next();
});

export const Lead = mongoose.model("Lead", leadSchema);