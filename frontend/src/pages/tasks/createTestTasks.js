import axios from 'axios';
import axiosInstance from '../../api/axios';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";
axios.defaults.withCredentials = true;

const createTestTasks = async (user_id, project_id) => {
    const tasks = [
        {
            assigned_to_user_id: user_id,
            project_id: project_id,
            title: "Website Redesign Homepage",
            description: "Create new homepage design with modern UI elements",
            priority: "High",
            status: "In Progress",
            subtasks: [
                {
                    title: "Design mockup in Figma",
                    assigned_to_user_id: user_id
                },
                {
                    title: "Get client approval",
                    assigned_to_user_id: user_id
                }
            ]
        },
        {
            assigned_to_user_id: user_id,
            project_id: project_id,
            title: "API Integration",
            description: "Integrate payment gateway API with error handling",
            priority: "High",
            status: "Pending",
            subtasks: [
                {
                    title: "Setup test environment",
                    assigned_to_user_id: user_id
                }
            ]
        },
        {
            assigned_to_user_id: user_id,
            project_id: project_id,
            title: "Bug Fix - Login Flow",
            description: "Fix user authentication issues in login process",
            priority: "Medium",
            status: "Completed",
            subtasks: []
        },
        {
            assigned_to_user_id: user_id,
            project_id: project_id,
            title: "Weekly Team Meeting",
            description: "Discuss project progress and upcoming milestones",
            priority: "Low",
            status: "Pending",
            subtasks: []
        },
        {
            assigned_to_user_id: user_id,
            project_id: project_id,
            title: "Database Optimization",
            description: "Optimize database queries for better performance",
            priority: "Medium",
            status: "In Progress",
            subtasks: [
                {
                    title: "Analyze current queries",
                    assigned_to_user_id: user_id
                },
                {
                    title: "Implement caching",
                    assigned_to_user_id: user_id
                }
            ]
        }
    ];

    try {
        const createdTasks = [];
        for (const task of tasks) {
            console.log("Creating task:", task.title);
            const taskData = {
                ...task,
                assigned_to_user_id: user_id,
                project_id: project_id,
                status: task.status || "Pending"
            };
            
            const response = await axiosInstance.post(`${API_URL}/tasks/create`, taskData);
            console.log(`Created task: ${response.data.task.title}`);
            createdTasks.push(response.data.task);
        }
        console.log('All test tasks created successfully!');
        return createdTasks;
    } catch (error) {
        console.error('Error creating test tasks:', error.response || error);
        throw new Error(error.response?.data?.message || 'Failed to create test tasks');
    }
};

export default createTestTasks; 