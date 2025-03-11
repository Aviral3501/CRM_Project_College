import mongoose from "mongoose";
import Counter from "./counter.model.js"; // Import the Counter model

const memberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User
    role: {
        type: String,
        enum: ["admin", "editor", "viewer"], // Define roles for project members
        default: "viewer", // Default role
    },
    permissions: [{ type: String }], // Array of permissions (e.g., ["edit_tasks", "view_reports"])
});

const projectSchema = new mongoose.Schema(
    {
        project_id: { type: String, unique: true }, // Custom ID for the project
        title: { type: String, required: true },
        description: { type: String },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
        members: [memberSchema], // Array of members with their roles and permissions
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// Middleware to generate project_id
projectSchema.pre("save", async function (next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { _id: "projectId" }, // Use a fixed ID for the project counter
            { $inc: { sequenceValue: 1 } },
            { new: true, upsert: true }
        );
        this.project_id = `PRJ${String(counter.sequenceValue).padStart(9, '0')}`; // Format the ID to 12 characters
    }
    next();
});

export const Project = mongoose.model("Project", projectSchema);