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

        // Find all tasks directly assigned to the user from Task model
        const directTasks = await Task.find({ assignedTo: user._id })
            .populate('project', 'project_id name')
            .populate('createdBy', 'user_id name')
            .populate({
                path: 'subtasks',
                populate: {
                    path: 'assignedTo',
                    select: 'user_id name'
                }
            });

        // Find all projects where the user is assigned to tasks
        const projectsWithUserTasks = await Project.find({
            'tasks.assignedTo': user._id
        }).populate('tasks.assignedTo', 'user_id name')
          .populate('tasks.subtasks.assignedTo', 'user_id name');

        // Extract tasks from projects where user is assigned
        const projectTasks = projectsWithUserTasks.flatMap(project => 
            project.tasks
                .filter(task => task.assignedTo.some(assignee => assignee._id.equals(user._id)))
                .map(task => ({
                    task_id: task._id.toString(),
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    project: {
                        project_id: project.project_id,
                        name: project.name
                    },
                    createdBy: null, // Project tasks don't track creator
                    createdAt: task.createdAt,
                    subtasks: task.subtasks.map(subtask => ({
                        ...subtask.toObject(),
                        assignedTo: subtask.assignedTo ? {
                            user_id: subtask.assignedTo.user_id,
                            name: subtask.assignedTo.name
                        } : null
                    }))
                }))
        );

        // Combine both types of tasks
        const allTasks = [
            ...directTasks.map(task => ({
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                project: task.project,
                createdBy: task.createdBy,
                createdAt: task.createdAt,
                subtasks: task.subtasks
            })),
            ...projectTasks
        ];

        res.status(200).json({
            success: true,
            tasks: allTasks
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
            title,
            assigned_to_user_id,
            project_id,
            description,
            priority,
            subtasks
        } = req.body;

        // Validate required field
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });
        }

        // Find assignee if provided
        let assignee = null;
        if (assigned_to_user_id) {
            assignee = await User.findOne({ user_id: assigned_to_user_id });
            if (!assignee) {
                return res.status(404).json({
                    success: false,
                    message: "Assignee not found"
                });
            }
        }

        // Find project if provided
        let project = null;
        if (project_id) {
            project = await Project.findOne({ project_id });
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found"
                });
            }
        }

        // Create main task
        const taskData = {
            title: title.trim(),
            description: description?.trim(),
            priority: priority || 'Medium',
            createdBy: req.user._id
        };

        // Add optional fields if they exist
        if (assignee) {
            taskData.assignedTo = assignee._id;
            taskData.organization = assignee.organization;
        }
        if (project) {
            taskData.project = project._id;
        }

        const task = await Task.create(taskData);

        // Create subtasks if provided
        if (subtasks && subtasks.length > 0) {
            const createdSubtasks = await Promise.all(
                subtasks.map(async (subtask) => {
                    let subtaskAssignee = null;
                    if (subtask.assigned_to_user_id) {
                        subtaskAssignee = await User.findOne({ 
                            user_id: subtask.assigned_to_user_id 
                        });
                    }

                    return Subtask.create({
                        title: subtask.title,
                        task: task._id,
                        assignedTo: subtaskAssignee?._id || assignee?._id,
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