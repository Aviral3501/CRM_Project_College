import mongoose from "mongoose";
import Counter from "./counter.model.js"; // Import the Counter model

const organizationSchema = new mongoose.Schema(
	{
		org_id: { type: String, unique: true }, // Custom ID for the organization
		name: { type: String, required: true, unique: true }, // Organization name
		industry: { type: String }, // Industry type (e.g., IT, Finance, Healthcare)
		logo: { type: String }, // URL for the company logo
		address: { type: String },
		website: { type: String },
		admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The main admin
		employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Employees under this org
		totalRevenue: { type: Number, default: 0 }, // Track organization revenue
		leadSources: [{ type: String }], // ["Website", "Cold Call", "Referral"]
		pipelines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pipeline" }], // Sales pipelines
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

// Middleware to generate org_id
organizationSchema.pre("save", async function (next) {
	if (this.isNew) {
		const counter = await Counter.findOneAndUpdate(
			{ _id: "organizationId" }, // Use a fixed ID for the organization counter
			{ $inc: { sequenceValue: 1 } },
			{ new: true, upsert: true }
		);
		this.org_id = `ORG${String(counter.sequenceValue).padStart(9, '0')}`; // Format the ID to 12 characters
	}
	next();
});

export const Organization = mongoose.model("Organization", organizationSchema);