import mongoose from "mongoose";
import Counter from "./counter.model.js"; // Import the Counter model

const subtaskSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, default: "" },
	status: { 
		type: String, 
		enum: ["Pending", "In Progress", "Completed"], 
		default: "Pending" 
	},
	assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	dueDate: { type: Date }
});

const taskSchema = new mongoose.Schema(
	{
		task_id: { type: String, unique: true }, // Custom ID for the task
		title: { type: String, required: true },
		description: { type: String },
		status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
		priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
		organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		subtasks: [subtaskSchema]
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

export const Task = mongoose.model("Task", taskSchema);
export const Subtask = mongoose.model("Subtask", subtaskSchema);