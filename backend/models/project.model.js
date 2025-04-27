import mongoose from "mongoose";
import Counter from "./counter.model.js"; // Import the Counter model

const subtaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    status: { 
        type: String, 
        enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Not Started'
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: Date
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dueDate: Date,
    subtasks: [subtaskSchema]
});

const projectSchema = new mongoose.Schema({
    project_id: { type: String, unique: true },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Not Started'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    deadline: {
        type: Date
    },
    team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tasks: [taskSchema],
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

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

// Calculate project progress based on tasks
projectSchema.methods.calculateProgress = function() {
    if (!this.tasks || this.tasks.length === 0) return 0;
    
    const completedTasks = this.tasks.filter(task => task.status === 'Completed').length;
    return Math.round((completedTasks / this.tasks.length) * 100);
};

// Update progress before saving
projectSchema.pre('save', function(next) {
    if (this.tasks && this.tasks.length > 0) {
        this.progress = this.calculateProgress();
    }
    next();
});

export const Project = mongoose.model('Project', projectSchema);