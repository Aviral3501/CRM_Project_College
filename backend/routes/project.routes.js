import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { Project } from "../models/project.model.js";
import { Organization } from "../models/org.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Task } from '../models/task.model.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protectRoute);

// Validate organization_id and user_id
const validateIds = async (req, res, next) => {
    const { organization_id, user_id } = req.body;
    
    if (!organization_id) {
        return res.status(400).json({
            success: false,
            message: "organization_id is required"
        });
    }
    
    if (!user_id) {
        return res.status(400).json({
            success: false,
            message: "user_id is required"
        });
    }

    // Find organization by org_id
    const organization = await Organization.findOne({ org_id: organization_id });
    if (!organization) {
        return res.status(404).json({
            success: false,
            message: "Organization not found"
        });
    }

    // Find user by user_id
    const user = await User.findOne({ user_id });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    // Add organization and user to request
    req.organization = organization;
    req.user = user;
    
    next();
};

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

// Get all projects for an organization
router.post('/get-projects', validateIds, async (req, res) => {
    try {
        const projects = await Project.find({ organization: req.organization._id })
            .populate('team', 'name user_id')
            .populate('createdBy', 'name user_id')
            .populate('updatedBy', 'name user_id')
            .populate('tasks.assignedTo', 'name user_id')
            .populate('tasks.subtasks.assignedTo', 'name user_id');

        res.json({
            success: true,
            data: projects.map(project => ({
                project_id: project.project_id,
                name: project.name,
                description: project.description,
                status: project.status,
                deadline: project.deadline?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                team: project.team.map(member => member.name),
                progress: project.progress,
                priority: project.priority,
                tasks: project.tasks.map(task => ({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    assignedTo: task.assignedTo?.map(user => user.user_id) || [],
                    dueDate: task.dueDate?.toISOString().split('T')[0] || null,
                    subtasks: task.subtasks?.map(subtask => ({
                        title: subtask.title,
                        description: subtask.description,
                        status: subtask.status,
                        assignedTo: subtask.assignedTo?.user_id || null,
                        dueDate: subtask.dueDate?.toISOString().split('T')[0] || null,
                        _id: subtask._id
                    })) || [],
                    _id: task._id
                }))
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new project
router.post('/create-project', validateIds, async (req, res) => {
    try {
        const { team, tasks, ...projectData } = req.body;
        
        // Find team members by user_id
        let teamRefs = [];
        if (team && team.length > 0) {
            teamRefs = await Promise.all(team.map(async (member) => {
                // Handle both string user_id and object with user_id property
                const userId = typeof member === 'string' ? member : member.user_id;
                const user = await User.findOne({ user_id: userId });
                if (!user) {
                    throw new Error(`User with ID ${userId} not found`);
                }
                return user._id;
            }));
        }

        // Process tasks if they exist
        let processedTasks = [];
        if (tasks && tasks.length > 0) {
            processedTasks = await Promise.all(tasks.map(async (task) => {
                // Process assignedTo for main task
                let assignedToRefs = [];
                if (task.assignedTo && task.assignedTo.length > 0) {
                    assignedToRefs = await Promise.all(task.assignedTo.map(async (userId) => {
                        // Handle both string user_id and object with user_id property
                        const userIdentifier = typeof userId === 'string' ? userId : userId.user_id;
                        const user = await User.findOne({ user_id: userIdentifier });
                        if (!user) {
                            throw new Error(`User with ID ${userIdentifier} not found`);
                        }
                        return user._id;
                    }));
                }

                // Process subtasks
                let processedSubtasks = [];
                if (task.subtasks && task.subtasks.length > 0) {
                    processedSubtasks = await Promise.all(task.subtasks.map(async (subtask) => {
                        let subtaskAssignedTo = null;
                        if (subtask.assignedTo) {
                            // Handle both string user_id and object with user_id property
                            const userIdentifier = typeof subtask.assignedTo === 'string' ? subtask.assignedTo : subtask.assignedTo.user_id;
                            const user = await User.findOne({ user_id: userIdentifier });
                            if (!user) {
                                throw new Error(`User with ID ${userIdentifier} not found`);
                            }
                            subtaskAssignedTo = user._id;
                        }

                        return {
                            title: subtask.title,
                            description: subtask.description,
                            status: subtask.status,
                            assignedTo: subtaskAssignedTo,
                            dueDate: subtask.dueDate
                        };
                    }));
                }

                return {
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    assignedTo: assignedToRefs,
                    dueDate: task.dueDate,
                    subtasks: processedSubtasks
                };
            }));
        }

        const project = new Project({
            ...projectData,
            organization: req.organization._id,
            team: teamRefs,
            tasks: processedTasks,
            createdBy: req.user._id,
            updatedBy: req.user._id
        });

        await project.save();

        // Populate the project with user information
        const populatedProject = await Project.findById(project._id)
            .populate('team', 'name user_id')
            .populate('createdBy', 'name user_id')
            .populate('updatedBy', 'name user_id')
            .populate('tasks.assignedTo', 'name user_id')
            .populate('tasks.subtasks.assignedTo', 'name user_id');

        res.json({
            success: true,
            data: {
                project_id: populatedProject.project_id,
                name: populatedProject.name,
                description: populatedProject.description,
                status: populatedProject.status,
                deadline: populatedProject.deadline?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                team: populatedProject.team.map(member => member.name),
                progress: populatedProject.progress,
                priority: populatedProject.priority,
                tasks: populatedProject.tasks.map(task => ({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    assignedTo: task.assignedTo?.map(user => user.user_id) || [],
                    dueDate: task.dueDate?.toISOString().split('T')[0] || null,
                    subtasks: task.subtasks?.map(subtask => ({
                        title: subtask.title,
                        description: subtask.description,
                        status: subtask.status,
                        assignedTo: subtask.assignedTo?.user_id || null,
                        dueDate: subtask.dueDate?.toISOString().split('T')[0] || null,
                        _id: subtask._id
                    })) || [],
                    _id: task._id
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update a project
router.post('/update-project', validateIds, async (req, res) => {
    try {
        const { project_id, team, tasks, ...updateData } = req.body;
        
        if (!project_id) {
            return res.status(400).json({
                success: false,
                message: "project_id is required"
            });
        }

        // Find team members by user_id if team is provided
        let teamRefs = null;
        if (team && team.length > 0) {
            teamRefs = await Promise.all(team.map(async (member) => {
                // Handle both string user_id and object with user_id property
                const userId = typeof member === 'string' ? member : member.user_id;
                const user = await User.findOne({ user_id: userId });
                if (!user) {
                    throw new Error(`User with ID ${userId} not found`);
                }
                return user._id;
            }));
        }

        // Process tasks if they exist
        let processedTasks = null;
        if (tasks && tasks.length > 0) {
            processedTasks = await Promise.all(tasks.map(async (task) => {
                // Process assignedTo for main task
                let assignedToRefs = [];
                if (task.assignedTo && task.assignedTo.length > 0) {
                    assignedToRefs = await Promise.all(task.assignedTo.map(async (userId) => {
                        // Handle both string user_id and object with user_id property
                        const userIdentifier = typeof userId === 'string' ? userId : userId.user_id;
                        const user = await User.findOne({ user_id: userIdentifier });
                        if (!user) {
                            throw new Error(`User with ID ${userIdentifier} not found`);
                        }
                        return user._id;
                    }));
                }

                // Process subtasks
                let processedSubtasks = [];
                if (task.subtasks && task.subtasks.length > 0) {
                    processedSubtasks = await Promise.all(task.subtasks.map(async (subtask) => {
                        let subtaskAssignedTo = null;
                        if (subtask.assignedTo) {
                            // Handle both string user_id and object with user_id property
                            const userIdentifier = typeof subtask.assignedTo === 'string' ? subtask.assignedTo : subtask.assignedTo.user_id;
                            const user = await User.findOne({ user_id: userIdentifier });
                            if (!user) {
                                throw new Error(`User with ID ${userIdentifier} not found`);
                            }
                            subtaskAssignedTo = user._id;
                        }

                        return {
                            title: subtask.title,
                            description: subtask.description,
                            status: subtask.status,
                            assignedTo: subtaskAssignedTo,
                            dueDate: subtask.dueDate
                        };
                    }));
                }

                return {
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    assignedTo: assignedToRefs,
                    dueDate: task.dueDate,
                    subtasks: processedSubtasks
                };
            }));
        }

        const project = await Project.findOneAndUpdate(
            { project_id, organization: req.organization._id },
            { 
                ...updateData,
                team: teamRefs || undefined,
                tasks: processedTasks || undefined,
                updatedBy: req.user._id 
            },
            { new: true }
        ).populate('team', 'name user_id')
         .populate('createdBy', 'name user_id')
         .populate('updatedBy', 'name user_id')
         .populate('tasks.assignedTo', 'name user_id')
         .populate('tasks.subtasks.assignedTo', 'name user_id');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            data: {
                project_id: project.project_id,
                name: project.name,
                description: project.description,
                status: project.status,
                deadline: project.deadline?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                team: project.team.map(member => member.name),
                progress: project.progress,
                priority: project.priority,
                tasks: project.tasks.map(task => ({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    assignedTo: task.assignedTo?.map(user => user.user_id) || [],
                    dueDate: task.dueDate?.toISOString().split('T')[0] || null,
                    subtasks: task.subtasks?.map(subtask => ({
                        title: subtask.title,
                        description: subtask.description,
                        status: subtask.status,
                        assignedTo: subtask.assignedTo?.user_id || null,
                        dueDate: subtask.dueDate?.toISOString().split('T')[0] || null,
                        _id: subtask._id
                    })) || [],
                    _id: task._id
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a project
router.post('/delete-project', validateIds, async (req, res) => {
    try {
        const { project_id } = req.body;
        
        if (!project_id) {
            return res.status(400).json({
                success: false,
                message: "project_id is required"
            });
        }

        const project = await Project.findOneAndDelete({
            project_id,
            organization: req.organization._id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 