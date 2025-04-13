import express from "express";
import { createTask, getUserTasks } from "../controllers/task.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { Task } from '../models/task.model.js';
import { Project } from '../models/project.model.js';
import { Organization } from '../models/org.model.js';
import { User } from '../models/user.model.js';

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

// // POST /api/get-task - Get all tasks for the logged-in user
// router.post("/get-task", getUserTasks);

// // POST /api/create-task - Create a new task
// router.post("/create-task", createTask);

// Get all tasks for an organization
router.post('/get-tasks', validateIds, async (req, res) => {
    try {
        const tasks = await Task.find({ organization: req.organization._id })
            .populate('assignedTo', 'name')
            .populate('project', 'name')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        res.json({
            success: true,
            data: tasks.map(task => ({
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                project: {
                    title: task.project?.name || 'Unassigned'
                },
                dueDate: task.dueDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                createdAt: task.createdAt,
                subtasks: task.subtasks || []
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create a new task
router.post('/create-task', validateIds, async (req, res) => {
    try {
        const { project_id, subtasks, ...taskData } = req.body;
        
        // Find project by project_id
        let projectRef = null;
        if (project_id) {
            projectRef = await Project.findOne({ project_id: project_id });
            if (!projectRef) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found"
                });
            }
        }

        // Process subtasks if they exist
        let processedSubtasks = [];
        if (subtasks && subtasks.length > 0) {
            processedSubtasks = subtasks.map(subtask => ({
                title: subtask.title,
                description: subtask.description || '',
                status: subtask.status || 'Pending',
                assignedTo: null,
                dueDate: subtask.dueDate ? new Date(subtask.dueDate) : null
            }));
        }

        const task = new Task({
            ...taskData,
            organization: req.organization._id,
            project: projectRef?._id,
            createdBy: req.user._id,
            updatedBy: req.user._id,
            subtasks: processedSubtasks
        });

        await task.save();

        res.json({
            success: true,
            data: {
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                project: {
                    title: projectRef?.name || 'Unassigned'
                },
                dueDate: task.dueDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                createdAt: task.createdAt,
                subtasks: task.subtasks.map(subtask => ({
                    title: subtask.title,
                    description: subtask.description,
                    status: subtask.status,
                    assignedTo: subtask.assignedTo,
                    dueDate: subtask.dueDate?.toISOString().split('T')[0] || null
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

// Update a task
router.post('/update-task', validateIds, async (req, res) => {
    try {
        const { task_id, project_id, subtasks, ...updateData } = req.body;
        
        if (!task_id) {
            return res.status(400).json({
                success: false,
                message: "task_id is required"
            });
        }

        // Find project by project_id if provided
        let projectRef = null;
        if (project_id) {
            projectRef = await Project.findOne({ project_id: project_id });
            if (!projectRef) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found"
                });
            }
        }

        // Process subtasks if they exist
        let processedSubtasks;
        if (subtasks) {
            processedSubtasks = subtasks.map(subtask => ({
                title: subtask.title,
                description: subtask.description || '',
                status: subtask.status || 'Pending',
                assignedTo: null,
                dueDate: subtask.dueDate ? new Date(subtask.dueDate) : null
            }));
        }

        const task = await Task.findOneAndUpdate(
            { task_id, organization: req.organization._id },
            { 
                ...updateData,
                project: projectRef?._id,
                updatedBy: req.user._id,
                ...(processedSubtasks && { subtasks: processedSubtasks })
            },
            { new: true }
        ).populate('project', 'name');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: {
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                project: {
                    title: task.project?.name || 'Unassigned'
                },
                dueDate: task.dueDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                createdAt: task.createdAt,
                subtasks: task.subtasks.map(subtask => ({
                    title: subtask.title,
                    description: subtask.description,
                    status: subtask.status,
                    assignedTo: subtask.assignedTo,
                    dueDate: subtask.dueDate?.toISOString().split('T')[0] || null
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

// Delete a task
router.post('/delete-task', validateIds, async (req, res) => {
    try {
        const { task_id } = req.body;
        
        if (!task_id) {
            return res.status(400).json({
                success: false,
                message: "task_id is required"
            });
        }

        const task = await Task.findOneAndDelete({
            task_id,
            organization: req.organization._id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 