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
            .populate('project', 'name project_id')
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
                    project_id: task.project?.project_id || null,
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

// Get all tasks grouped by projects
router.post('/get-task-in-groups', validateIds, async (req, res) => {
    try {
        const tasks = await Task.find({ organization: req.organization._id })
            .populate('assignedTo', 'name')
            .populate('project', 'name project_id')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name');

        // Group tasks by project
        const tasksByProject = tasks.reduce((acc, task) => {
            const projectId = task.project?.project_id || 'unassigned';
            const projectName = task.project?.name || 'Unassigned';
            
            if (!acc[projectId]) {
                acc[projectId] = {
                    project_id: projectId,
                    project_name: projectName,
                    tasks: []
                };
            }
            
            acc[projectId].tasks.push({
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                createdAt: task.createdAt,
                subtasks: task.subtasks || []
            });
            
            return acc;
        }, {});

        // Convert to array format
        const groupedTasks = Object.values(tasksByProject);

        res.json({
            success: true,
            data: groupedTasks
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
        const { project_id, tasks, ...otherData } = req.body;
        
        // Check if project_id is provided
        if (!project_id) {
            return res.status(400).json({
                success: false,
                message: "project_id is required"
            });
        }
        
        // Find project by project_id
        const projectRef = await Project.findOne({ project_id: project_id });
        if (!projectRef) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Check if tasks array is provided
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one task is required"
            });
        }

        // Process each task
        const createdTasks = [];
        for (const taskData of tasks) {
            const { subtasks, ...singleTaskData } = taskData;
            
            // Process subtasks if they exist
            let processedSubtasks = [];
            if (subtasks && subtasks.length > 0) {
                processedSubtasks = subtasks.map(subtask => {
                    // Map subtask status if needed
                    let subtaskStatus = subtask.status;
                    if (subtaskStatus === 'Pending') {
                        subtaskStatus = 'Not Started'; // Convert to valid subtask status
                    }
                    
                    return {
                        title: subtask.title,
                        description: subtask.description || '',
                        status: subtaskStatus || 'Not Started',
                        assignedTo: null,
                        dueDate: subtask.dueDate ? new Date(subtask.dueDate) : null
                    };
                });
            }

            const task = new Task({
                ...singleTaskData,
                organization: req.organization._id,
                project: projectRef._id,
                createdBy: req.user._id,
                updatedBy: req.user._id,
                subtasks: processedSubtasks
            });

            await task.save();

            // Update the project's tasks array with the new task
            await Project.findByIdAndUpdate(
                projectRef._id,
                { $push: { tasks: task._id } }
            );

            createdTasks.push({
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                project: {
                    project_id: projectRef.project_id,
                    title: projectRef.name
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
            });
        }

        res.json({
            success: true,
            data: createdTasks
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
        const { project_id, tasks, ...otherData } = req.body;
        
        // Check if project_id is provided
        if (!project_id) {
            return res.status(400).json({
                success: false,
                message: "project_id is required"
            });
        }

        // Find project by project_id
        const projectRef = await Project.findOne({ project_id: project_id });
        if (!projectRef) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Check if tasks array is provided
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one task is required"
            });
        }

        // Process each task
        const updatedTasks = [];
        for (const taskData of tasks) {
            const { task_id, subtasks, ...singleTaskData } = taskData;
            
            if (!task_id) {
                return res.status(400).json({
                    success: false,
                    message: "task_id is required for each task"
                });
            }

            // Process subtasks if they exist
            let processedSubtasks;
            if (subtasks) {
                processedSubtasks = subtasks.map(subtask => {
                    // Map subtask status if needed
                    let subtaskStatus = subtask.status;
                    if (subtaskStatus === 'Pending') {
                        subtaskStatus = 'Not Started'; // Convert to valid subtask status
                    }
                    
                    return {
                        title: subtask.title,
                        description: subtask.description || '',
                        status: subtaskStatus || 'Not Started',
                        assignedTo: null,
                        dueDate: subtask.dueDate ? new Date(subtask.dueDate) : null
                    };
                });
            }

            const task = await Task.findOneAndUpdate(
                { task_id, organization: req.organization._id },
                { 
                    ...singleTaskData,
                    project: projectRef._id,
                    updatedBy: req.user._id,
                    ...(processedSubtasks && { subtasks: processedSubtasks })
                },
                { new: true }
            ).populate('project', 'name project_id');

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: `Task with ID ${task_id} not found`
                });
            }

            updatedTasks.push({
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                project: {
                    project_id: task.project.project_id,
                    title: task.project.name
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
            });
        }

        res.json({
            success: true,
            data: updatedTasks
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