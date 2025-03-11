import mongoose from "mongoose";
import Counter from "./counter.model.js"; // Import the Counter model

const taskSchema = new mongoose.Schema(
	{
		task_id: { type: String, unique: true }, // Custom ID for the task
		title: { type: String, required: true },
		description: { type: String },
		status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
		priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
		organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

// Middleware to generate custom ID
taskSchema.pre("save", async function (next) {
	if (this.isNew) {
		const counter = await Counter.findOneAndUpdate(
			{ _id: "taskId" }, // Use a fixed ID for the task counter
			{ $inc: { sequenceValue: 1 } },
			{ new: true, upsert: true }
		);
		this.task_id = `TSK${String(counter.sequenceValue).padStart(9, '0')}`; // Format the ID
	}
	next();
});

const subtaskSchema = new mongoose.Schema(
	{
		subtask_id: { type: String, unique: true }, // Custom ID for the subtask
		title: { type: String, required: true },
		status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
		task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

// Middleware to generate custom ID
subtaskSchema.pre("save", async function (next) {
	if (this.isNew) {
		const counter = await Counter.findOneAndUpdate(
			{ _id: "subtaskId" }, // Use a fixed ID for the subtask counter
			{ $inc: { sequenceValue: 1 } },
			{ new: true, upsert: true }
		);
		this.subtask_id = `SUBTSK${String(counter.sequenceValue).padStart(6, '0')}`; // Format the ID
	}
	next();
});



export const Subtask = mongoose.model("Subtask", subtaskSchema);

export const Task = mongoose.model("Task", taskSchema);