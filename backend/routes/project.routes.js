import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Helper function to convert custom IDs to MongoDB ObjectIds
const convertCustomIdsToObjectIds = async (data) => {
    // Convert organization_id to ObjectId
    if (data.organization_id) {
        const org = await mongoose.model("Organization").findOne({ org_id: data.organization_id });
        if (org) {
            data.organization = org._id;
        }
    }

    // Convert team member IDs to ObjectIds
    if (data.team && Array.isArray(data.team)) {
        const teamObjectIds = [];
        for (const userId of data.team) {
            const user = await User.findOne({ user_id: userId });
            if (user) {
                teamObjectIds.push(user._id);
            }
        }
        data.team = teamObjectIds;
    }

    // Convert task assignedTo IDs to ObjectIds
    if (data.tasks && Array.isArray(data.tasks)) {
        for (let i = 0; i < data.tasks.length; i++) {
            const task = data.tasks[i];
            
            // Convert assignedTo IDs
            if (task.assignedTo && Array.isArray(task.assignedTo)) {
                const assignedObjectIds = [];
                for (const userId of task.assignedTo) {
                    const user = await User.findOne({ user_id: userId });
                    if (user) {
                        assignedObjectIds.push(user._id);
                    }
                }
                task.assignedTo = assignedObjectIds;
            }
            
            // Convert subtask assignedTo IDs
            if (task.subtasks && Array.isArray(task.subtasks)) {
                for (let j = 0; j < task.subtasks.length; j++) {
                    const subtask = task.subtasks[j];
                    if (subtask.assignedTo) {
                        const user = await User.findOne({ user_id: subtask.assignedTo });
                        if (user) {
                            subtask.assignedTo = user._id;
                        }
                    }
                }
            }
        }
    }

    return data;
};

// POST /api/projects/list - Get all projects for an organization
router.post("/list", async (req, res) => {
    try {
        const { organization_id } = req.body;

        // Find organization by org_id
        const org = await mongoose.model("Organization").findOne({ org_id: organization_id });
        if (!org) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        const projects = await Project.find({ organization: org._id })
            .populate('team', 'user_id name email role')
            .populate('tasks.assignedTo', 'user_id name email role')
            .populate('tasks.subtasks.assignedTo', 'user_id name email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            projects
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching projects"
        });
    }
});

// POST /api/projects/create - Create a new project
router.post("/create", async (req, res) => {
            // MINIMAL FIELDS REQUIRED (ONLY RQUIRED FIELDS)

        // {
        //     "name": "Website Redesign",
        //     "organization_id": "ORG000000001"
        // }
    try {
        const projectData = { ...req.body };

        // {
        //     "name": "Website Redesign",
        //     "description": "Complete overhaul of company website",
        //     "status": "Not Started",
        //     "priority": "High",
        //     "deadline": "2024-04-30",
        //     "team": ["UID000000001", "UID000000002"],
        //     "tasks": [
        //         {
        //             "title": "Design Homepage",
        //             "description": "Create new homepage design",
        //             "status": "Pending",
        //             "priority": "High",
        //             "assignedTo": ["UID000000001"],
        //             "dueDate": "2024-03-15",
        //             "subtasks": [
        //                 {
        //                     "title": "Create wireframes",
        //                     "description": "Design wireframes for homepage",
        //                     "status": "Pending",
        //                     "assignedTo": "UID000000001",
        //                     "dueDate": "2024-03-10"
        //                 }
        //             ]
        //         }
        //     ],
        //     "organization_id": "ORG000000001"
        // }



        // Convert custom IDs to MongoDB ObjectIds
        const convertedData = await convertCustomIdsToObjectIds(projectData);
        
        // Add createdBy from the authenticated user
        convertedData.createdBy = req.user._id;

        const project = await Project.create(convertedData);

        const populatedProject = await Project.findById(project._id)
            .populate('team', 'user_id name email role')
            .populate('tasks.assignedTo', 'user_id name email role')
            .populate('tasks.subtasks.assignedTo', 'user_id name email role');

        res.status(201).json({
            success: true,
            project: populatedProject
        });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({
            success: false,
            message: "Error creating project",
            errors: error.errors
        });
    }
});

// POST /api/projects/update - Update a project
router.post("/update", async (req, res) => {
    try {
        const { project_id, ...updateData } = req.body;
        
        // Find project by project_id
        const existingProject = await Project.findOne({ project_id });
        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }
        
        // Convert custom IDs to MongoDB ObjectIds
        const convertedData = await convertCustomIdsToObjectIds(updateData);
        
        // Add updatedBy from the authenticated user
        convertedData.updatedBy = req.user._id;

        const project = await Project.findByIdAndUpdate(
            existingProject._id,
            convertedData,
            { new: true }
        ).populate('team', 'user_id name email role')
         .populate('tasks.assignedTo', 'user_id name email role')
         .populate('tasks.subtasks.assignedTo', 'user_id name email role');

        res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({
            success: false,
            message: "Error updating project"
        });
    }
});

// POST /api/projects/delete - Delete a project
router.post("/delete", async (req, res) => {
    try {
        const { project_id } = req.body;

        const project = await Project.findOneAndDelete({ project_id });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting project"
        });
    }
});

export default router; 