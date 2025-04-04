import { Task, Subtask } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";

// Get all tasks assigned to a user
export const getUserTasks = async (req, res) => {
    try {
        const { user_id } = req.body;

        // Find user by user_id
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find all tasks assigned to the user
        const tasks = await Task.find({ assignedTo: user._id })
            .populate('project', 'project_id title')
            .populate('createdBy', 'user_id name')
            .populate({
                path: 'subtasks',
                populate: {
                    path: 'assignedTo',
                    select: 'user_id name'
                }
            });

        res.status(200).json({
            success: true,
            tasks: tasks.map(task => ({
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                project: task.project,
                createdBy: task.createdBy,
                createdAt: task.createdAt,
                subtasks: task.subtasks
            }))
        });

    } catch (error) {
        console.error("Error in getUserTasks:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching tasks"
        });
    }
};

// Create a new task with optional subtasks
export const createTask = async (req, res) => {
    try {
        const { 
            assigned_to_user_id, // User ID of assignee
            project_id,          // Project ID
            title,
            description,
            priority,
            subtasks           // Array of subtask objects
        } = req.body;

        // Find assignee by user_id
        const assignee = await User.findOne({ user_id: assigned_to_user_id });
        if (!assignee) {
            return res.status(404).json({
                success: false,
                message: "Assignee not found"
            });
        }

        // Find project by project_id
        const project = await Project.findOne({ project_id });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Create main task
        const task = await Task.create({
            title,
            description,
            priority,
            assignedTo: assignee._id,
            project: project._id,
            organization: assignee.organization,
            createdBy: req.user._id // Assuming req.user is set by auth middleware
        });

        // Create subtasks if provided
        if (subtasks && subtasks.length > 0) {
            const createdSubtasks = await Promise.all(
                subtasks.map(async (subtask) => {
                    const subtaskAssignee = await User.findOne({ 
                        user_id: subtask.assigned_to_user_id 
                    });

                    return Subtask.create({
                        title: subtask.title,
                        task: task._id,
                        assignedTo: subtaskAssignee?._id || assignee._id,
                        createdBy: req.user._id
                    });
                })
            );

            // Add subtasks to task
            task.subtasks = createdSubtasks.map(subtask => subtask._id);
            await task.save();
        }

        // Return created task with populated fields
        const populatedTask = await Task.findById(task._id)
            .populate('project', 'project_id title')
            .populate('assignedTo', 'user_id name')
            .populate('createdBy', 'user_id name')
            .populate({
                path: 'subtasks',
                populate: {
                    path: 'assignedTo',
                    select: 'user_id name'
                }
            });

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: populatedTask
        });

    } catch (error) {
        console.error("Error in createTask:", error);
        res.status(500).json({
            success: false,
            message: "Error creating task"
        });
    }
}; 