import mongoose from "mongoose";
import Counter from "./counter.model.js"; // Import the Counter model

const aiInsightSchema = new mongoose.Schema(
	{
		ai_insight_id: { type: String, unique: true }, // Custom ID for the AI Insight
		type: { type: String, enum: ["Sales Forecast", "Task Optimization", "Lead Scoring"], required: true },
		data: { type: Object, required: true }, // Stores AI-generated suggestions
		relatedEntity: { type: mongoose.Schema.Types.ObjectId, refPath: "entityModel" }, // Can relate to any schema
		entityModel: { type: String, enum: ["Task", "Lead", "Deal"], required: true }, // Determines the related schema
		organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

// Middleware to generate ai_insight_id
aiInsightSchema.pre("save", async function (next) {
	if (this.isNew) {
		const counter = await Counter.findOneAndUpdate(
			{ _id: "aiInsightId" }, // Use a fixed ID for the AI Insight counter
			{ $inc: { sequenceValue: 1 } },
			{ new: true, upsert: true }
		);
		this.ai_insight_id = `AI${String(counter.sequenceValue).padStart(9, '0')}`; // Format the ID to 12 characters
	}
	next();
});

export const AIInsight = mongoose.model("AIInsight", aiInsightSchema);