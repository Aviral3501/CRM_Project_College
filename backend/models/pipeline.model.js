import mongoose from "mongoose";
import Counter from "./counter.model.js";

const pipelineSchema = new mongoose.Schema(
	{
		pipeline_id: { type: String, unique: true },
		title: { type: String, required: true },
		amount: { type: Number, required: true },
		stage: { 
			type: String, 
			enum: ["Qualified", "Proposal", "Negotiation","Contract", "Closed Won", "Closed Lost"], 
			default: "Qualified" 
		},
		lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
		client_id: { type: String },
		client: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Client'
		},
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		expectedCloseDate: { type: Date },
		notes: { type: String },
		probability: { type: Number, default: 0 },
		products: [{ 
			name: { type: String },
			quantity: { type: Number },
			price: { type: Number }
		}]
	},
	{ timestamps: true }
);

// Middleware to generate pipeline_id
pipelineSchema.pre("save", async function (next) {
	if (this.isNew) {
		const counter = await Counter.findOneAndUpdate(
			{ _id: "pipelineId" },
			{ $inc: { sequenceValue: 1 } },
			{ new: true, upsert: true }
		);
		this.pipeline_id = `PIP${String(counter.sequenceValue).padStart(9, '0')}`;
	}
	next();
});

export const Pipeline = mongoose.model("Pipeline", pipelineSchema); 