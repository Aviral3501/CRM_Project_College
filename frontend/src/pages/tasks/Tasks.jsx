import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Plus, Calendar, Clock, CheckCircle, Circle, X, BarChart3, PieChart, TrendingUp, AlertTriangle, ChevronDown } from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart as RePieChart, 
    Pie, 
    Cell,
    RadarChart, 
    Radar, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis,
    AreaChart, 
    Area, 
    LineChart, 
    Line,
    ComposedChart,
    Scatter,
    Legend,
    CartesianGrid
} from 'recharts';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';

const TaskModal = ({ isOpen, onClose, onSubmit }) => {
    const initialFormState = {
        title: '',
        description: '',
        priority: 'Medium',
        project: '',
        project_id: '',
        status: 'Not Started',
        dueDate: new Date().toISOString().split('T')[0],
        subtasks: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [newSubtask, setNewSubtask] = useState('');
    const [errors, setErrors] = useState({});
    const [projects, setProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { userData, BASE_URL } = useUser();

    const priorities = ['Low', 'Medium', 'High'];
    const statuses = ['Not Started', 'In Progress', 'Completed'];

    // Fetch projects when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen]);

    const fetchProjects = async () => {
        try {
            setIsLoadingProjects(true);
            console.log('Fetching projects from:', `${BASE_URL}/projects/get-projects`);
            console.log('Request payload:', {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            const response = await axiosInstance.post(`${BASE_URL}/projects/get-projects`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });
            
            console.log('Projects API Response:', response.data);
            
            if (response.data.success) {
                const projectsData = response.data.data || [];
                setProjects(projectsData);
                console.log('Projects fetched successfully:', projectsData.length, 'projects');
            } else {
                console.error('API Error:', response.data.message);
                toast.error(response.data.message || "Failed to fetch projects");
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error("Failed to fetch projects. Please try again later.");
        } finally {
            setIsLoadingProjects(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormState);
            setNewSubtask('');
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for project selection
        if (name === 'project') {
            const selectedProject = projects.find(p => p.name === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                project_id: selectedProject ? selectedProject.project_id : ''
            }));
        } else {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        }
        
        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setFormData(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, { 
                    title: newSubtask.trim(),
                    description: '',
                    status: 'Not Started',
                    assignedTo: userData.user_id,
                    dueDate: formData.dueDate
                }]
            }));
            setNewSubtask('');
        }
    };

    const removeSubtask = (index) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.project) newErrors.project = 'Project is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Prepare the payload
            const payload = {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                project_id: formData.project_id,
                tasks: [
                    {
                        title: formData.title,
                        description: formData.description,
                        status: formData.status,
                        priority: formData.priority,
                        dueDate: formData.dueDate,
                        team: [userData.user_id],
                        subtasks: formData.subtasks.map(subtask => ({
                            title: subtask.title,
                            description: subtask.description || '',
                            status: subtask.status || 'Not Started',
                            assignedTo: subtask.assignedTo || userData.user_id,
                            dueDate: subtask.dueDate || formData.dueDate
                        }))
                    }
                ]
            };
            
            console.log('Creating task with payload:', payload);
            
            const response = await axiosInstance.post(`${BASE_URL}/tasks/create-task`, payload);
            
            console.log('Create task response:', response.data);
            
            if (response.data.success) {
                toast.success('Task created successfully!');
                
                // Call the onSubmit callback with the created task
                if (response.data.data && response.data.data.length > 0) {
                    onSubmit(response.data.data[0]);
                } else {
                    // Fallback if the API doesn't return the created task
        onSubmit({
            ...formData,
                        task_id: `TSK${Date.now()}`,
                        createdAt: new Date(),
                        project: { title: formData.project }
        });
                }
                
        onClose();
            } else {
                toast.error(response.data.message || 'Failed to create task');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error(error.response?.data?.message || 'Failed to create task. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-2xl my-8">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold">Create New Task</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter task title"
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Enter task description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date *
                            </label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full p-2 border rounded-md ${
                                    errors.dueDate ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.dueDate && (
                                <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project *
                            </label>
                            <select
                                name="project"
                                value={formData.project}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-md ${errors.project ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={isLoadingProjects}
                            >
                                <option value="">Select Project</option>
                                {projects.map(project => (
                                    <option key={project.project_id} value={project.name}>{project.name}</option>
                                ))}
                            </select>
                            {isLoadingProjects && (
                                <p className="text-blue-500 text-xs mt-1">Loading projects...</p>
                            )}
                            {errors.project && <p className="text-red-500 text-xs mt-1">{errors.project}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                {priorities.map(priority => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subtasks
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-md"
                                placeholder="Enter subtask"
                            />
                            <button
                                type="button"
                                onClick={addSubtask}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                                Add
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {formData.subtasks.map((subtask, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                                    <span className="flex-1">{subtask.title}</span>
                                    {/* {console.log("subtask.title",subtask.title)} */}
                                    <button
                                        type="button"
                                        onClick={() => removeSubtask(index)}
                                        className="text-red-500"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 p-4 border-t sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TaskDetailsModal = ({ isOpen, onClose, task, onUpdate }) => {
    const initialFormState = {
        title: '',
        description: '',
        priority: 'Medium',
        project: {
            project_id: '',
            title: ''
        },
        status: 'Not Started',
        dueDate: new Date().toISOString().split('T')[0],
        subtasks: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [newSubtask, setNewSubtask] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [projects, setProjects] = useState([]);
    const { userData, BASE_URL } = useUser();

    const priorities = ['Low', 'Medium', 'High'];
    const statuses = ['Not Started', 'In Progress', 'Completed'];

    // Fetch projects when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen]);

    const fetchProjects = async () => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/projects/get-projects`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });
            
            if (response.data.success) {
                setProjects(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error("Failed to fetch projects");
        }
    };

    useEffect(() => {
        if (task && isOpen) {
            setFormData({
                ...task,
                project: {
                    project_id: task.project.project_id,
                    title: task.project.title
                },
                subtasks: task.subtasks || []
            });
        } else if (!isOpen) {
            setFormData(initialFormState);
            setNewSubtask('');
        }
    }, [task, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for project selection
        if (name === 'project') {
            const selectedProject = projects.find(p => p.name === value);
            setFormData(prev => ({
                ...prev,
                project: {
                    project_id: selectedProject ? selectedProject.project_id : '',
                    title: value
                }
            }));
        } else {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        }
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setFormData(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, {
                    title: newSubtask.trim(),
                    description: '',
                    status: 'Not Started',
                    assignedTo: null,
                    dueDate: formData.dueDate
                }]
            }));
            setNewSubtask('');
        }
    };

    const removeSubtask = (index) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            console.log("formData", formData);
            const payload = {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                project_id: formData.project.project_id,
                tasks: [{
                    task_id: task.task_id,
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority,
                    dueDate: formData.dueDate,
                    subtasks: formData.subtasks.map(subtask => ({
                        title: subtask.title,
                        description: subtask.description || '',
                        status: subtask.status || 'Not Started',
                        assignedTo: subtask.assignedTo || userData.user_id,
                        dueDate: subtask.dueDate || formData.dueDate
                    }))
                }]
            };

            console.log('Updating task with payload:', payload);

            const response = await axiosInstance.post(`${BASE_URL}/tasks/update-task`, payload);

            if (response.data.success) {
                toast.success('Task updated successfully!');
        onUpdate({
            ...formData,
                    project: formData.project
        });
        onClose();
            } else {
                toast.error(response.data.message || 'Failed to update task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error(error.response?.data?.message || 'Failed to update task. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl my-8">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold">Edit Task</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project
                            </label>
                            <select
                                name="project"
                                value={formData.project.title}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Select Project</option>
                                {projects.map(project => (
                                    <option key={project.project_id} value={project.name}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                {priorities.map(priority => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subtasks
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-md"
                                placeholder="Enter subtask"
                            />
                            <button
                                type="button"
                                onClick={addSubtask}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                                Add
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {formData.subtasks.map((subtask, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                                    <span className="flex-1">{subtask.title}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSubtask(index)}
                                        className="text-red-500"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 p-4 border-t sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AllTasksModal = ({ isOpen, onClose }) => {
    const [groupedTasks, setGroupedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedProjects, setExpandedProjects] = useState(new Set());
    const { userData, BASE_URL } = useUser();

    useEffect(() => {
        if (isOpen) {
            fetchGroupedTasks();
        }
    }, [isOpen]);

    const fetchGroupedTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(`${BASE_URL}/tasks/get-task-in-groups`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                setGroupedTasks(response.data.data);
                setExpandedProjects(new Set(response.data.data.map(project => project.project_id)));
            } else {
                toast.error("Failed to fetch tasks");
            }
        } catch (error) {
            console.error("Error fetching grouped tasks:", error);
            toast.error("Failed to fetch tasks");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleProject = (projectId) => {
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800';
            case 'not started':
                return 'bg-gray-100 text-gray-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold">All Tasks</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex-1">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : groupedTasks.length > 0 ? (
                        <div className="space-y-4">
                            {groupedTasks.map((project) => (
                                <div 
                                    key={project.project_id}
                                    className="border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
                                >
                                    <button
                                        onClick={() => toggleProject(project.project_id)}
                                        className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{project.project_name}</h3>
                                            <span className="text-sm text-gray-500">
                                                ({project.tasks.length} tasks)
                                            </span>
                                        </div>
                                        <div 
                                            className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-500 transition-transform duration-300 ${
                                                expandedProjects.has(project.project_id) ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    <div
                                        className={`transition-all duration-300 ease-in-out ${
                                            expandedProjects.has(project.project_id)
                                                ? 'max-h-[2000px] opacity-100'
                                                : 'max-h-0 opacity-0 overflow-hidden'
                                        }`}
                                    >
                                        <div className="p-4 space-y-3">
                                            {project.tasks.map((task) => (
                                                <div
                                                    key={task.task_id}
                                                    className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow duration-200"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-medium">{task.title}</h4>
                                                        <div className="flex gap-2">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                                    
                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                        <div className="mt-3">
                                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Subtasks:</h5>
                                                            <div className="space-y-2">
                                                                {task.subtasks.map((subtask, index) => (
                                                                    <div
                                                                        key={subtask._id}
                                                                        className="flex items-center gap-2 text-sm"
                                                                    >
                                                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(subtask.status).split(' ')[0]}`} />
                                                                        <span>{subtask.title}</span>
                                                                        {subtask.dueDate && (
                                                                            <span className="text-gray-500 text-xs">
                                                                                Due: {new Date(subtask.dueDate).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No tasks found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const CompletedTasksModal = ({ isOpen, onClose }) => {
    const [groupedTasks, setGroupedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedProjects, setExpandedProjects] = useState(new Set());
    const { userData, BASE_URL } = useUser();

    useEffect(() => {
        if (isOpen) {
            fetchGroupedTasks();
        }
    }, [isOpen]);

    const fetchGroupedTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(`${BASE_URL}/tasks/get-task-in-groups`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                // Filter for completed tasks and group by project
                const completedTasksByProject = response.data.data.map(project => ({
                    ...project,
                    tasks: project.tasks.filter(task => task.status === 'Completed')
                })).filter(project => project.tasks.length > 0);

                setGroupedTasks(completedTasksByProject);
                setExpandedProjects(new Set(completedTasksByProject.map(project => project.project_id)));
            } else {
                toast.error("Failed to fetch tasks");
            }
        } catch (error) {
            console.error("Error fetching grouped tasks:", error);
            toast.error("Failed to fetch tasks");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleProject = (projectId) => {
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold">Completed Tasks</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex-1">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : groupedTasks.length > 0 ? (
                        <div className="space-y-4">
                            {groupedTasks.map((project) => (
                                <div 
                                    key={project.project_id}
                                    className="border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
                                >
                                    <button
                                        onClick={() => toggleProject(project.project_id)}
                                        className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{project.project_name}</h3>
                                            <span className="text-sm text-gray-500">
                                                ({project.tasks.length} completed tasks)
                                            </span>
                                        </div>
                                        <div 
                                            className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-500 transition-transform duration-300 ${
                                                expandedProjects.has(project.project_id) ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    <div
                                        className={`transition-all duration-300 ease-in-out ${
                                            expandedProjects.has(project.project_id)
                                                ? 'max-h-[2000px] opacity-100'
                                                : 'max-h-0 opacity-0 overflow-hidden'
                                        }`}
                                    >
                                        <div className="p-4 space-y-3">
                                            {project.tasks.map((task) => (
                                                <div
                                                    key={task.task_id}
                                                    className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow duration-200"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-medium">{task.title}</h4>
                                                        <div className="flex gap-2">
                                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                                Completed
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                                    
                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                        <div className="mt-3">
                                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Subtasks:</h5>
                                                            <div className="space-y-2">
                                                                {task.subtasks.map((subtask, index) => (
                                                                    <div
                                                                        key={subtask._id}
                                                                        className="flex items-center gap-2 text-sm"
                                                                    >
                                                                        <div className={`w-2 h-2 rounded-full ${
                                                                            subtask.status === 'Completed' ? 'bg-green-500' :
                                                                            subtask.status === 'In Progress' ? 'bg-blue-500' :
                                                                            'bg-gray-500'
                                                                        }`} />
                                                                        <span>{subtask.title}</span>
                                                                        {subtask.dueDate && (
                                                                            <span className="text-gray-500 text-xs">
                                                                                Due: {new Date(subtask.dueDate).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                                                        <span>Completed: {new Date(task.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No completed tasks found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const InProgressTasksModal = ({ isOpen, onClose }) => {
    const [groupedTasks, setGroupedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedProjects, setExpandedProjects] = useState(new Set());
    const { userData, BASE_URL } = useUser();

    useEffect(() => {
        if (isOpen) {
            fetchGroupedTasks();
        }
    }, [isOpen]);

    const fetchGroupedTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(`${BASE_URL}/tasks/get-task-in-groups`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                // Filter for in-progress and not started tasks and group by project
                const inProgressTasksByProject = response.data.data.map(project => ({
                    ...project,
                    tasks: project.tasks.filter(task => 
                        task.status === 'In Progress' || task.status === 'Not Started'
                    )
                })).filter(project => project.tasks.length > 0);

                setGroupedTasks(inProgressTasksByProject);
                setExpandedProjects(new Set(inProgressTasksByProject.map(project => project.project_id)));
            } else {
                toast.error("Failed to fetch tasks");
            }
        } catch (error) {
            console.error("Error fetching grouped tasks:", error);
            toast.error("Failed to fetch tasks");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleProject = (projectId) => {
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold">In Progress Tasks</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex-1">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : groupedTasks.length > 0 ? (
                        <div className="space-y-4">
                            {groupedTasks.map((project) => (
                                <div 
                                    key={project.project_id}
                                    className="border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
                                >
                                    <button
                                        onClick={() => toggleProject(project.project_id)}
                                        className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{project.project_name}</h3>
                                            <span className="text-sm text-gray-500">
                                                ({project.tasks.length} tasks)
                                            </span>
                                        </div>
                                        <div 
                                            className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-500 transition-transform duration-300 ${
                                                expandedProjects.has(project.project_id) ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    <div
                                        className={`transition-all duration-300 ease-in-out ${
                                            expandedProjects.has(project.project_id)
                                                ? 'max-h-[2000px] opacity-100'
                                                : 'max-h-0 opacity-0 overflow-hidden'
                                        }`}
                                    >
                                        <div className="p-4 space-y-3">
                                            {project.tasks.map((task) => (
                                                <div
                                                    key={task.task_id}
                                                    className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow duration-200"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-medium">{task.title}</h4>
                                                        <div className="flex gap-2">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                task.status === 'In Progress' 
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {task.status}
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                                    
                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                        <div className="mt-3">
                                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Subtasks:</h5>
                                                            <div className="space-y-2">
                                                                {task.subtasks.map((subtask, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="flex items-center gap-2 text-sm"
                                                                    >
                                                                        <div className={`w-2 h-2 rounded-full ${
                                                                            subtask.status === 'Completed' ? 'bg-green-500' :
                                                                            subtask.status === 'In Progress' ? 'bg-blue-500' :
                                                                            'bg-gray-500'
                                                                        }`} />
                                                                        <span>{subtask.title}</span>
                                                                        {subtask.dueDate && (
                                                                            <span className="text-gray-500 text-xs">
                                                                                Due: {new Date(subtask.dueDate).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No in-progress tasks found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const HighPriorityTasksModal = ({ isOpen, onClose }) => {
    const [groupedTasks, setGroupedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedProjects, setExpandedProjects] = useState(new Set());
    const { userData, BASE_URL } = useUser();

    useEffect(() => {
        if (isOpen) {
            fetchGroupedTasks();
        }
    }, [isOpen]);

    const fetchGroupedTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(`${BASE_URL}/tasks/get-task-in-groups`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                // Get current date and date 3 days from now
                const today = new Date();
                const threeDaysFromNow = new Date();
                threeDaysFromNow.setDate(today.getDate() + 3);

                // Filter for high priority tasks and group by project
                const highPriorityTasksByProject = response.data.data.map(project => ({
                    ...project,
                    tasks: project.tasks.filter(task => {
                        const taskDueDate = new Date(task.dueDate);
                        const isHighPriority = task.priority === 'High';
                        const isDueSoon = taskDueDate <= threeDaysFromNow && taskDueDate >= today;
                        const hasManySubtasks = task.subtasks && task.subtasks.length >= 3;
                        
                        return isHighPriority || isDueSoon || hasManySubtasks;
                    })
                })).filter(project => project.tasks.length > 0);

                setGroupedTasks(highPriorityTasksByProject);
                setExpandedProjects(new Set(highPriorityTasksByProject.map(project => project.project_id)));
            } else {
                toast.error("Failed to fetch tasks");
            }
        } catch (error) {
            console.error("Error fetching grouped tasks:", error);
            toast.error("Failed to fetch tasks");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleProject = (projectId) => {
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    const getPriorityBadge = (task) => {
        const taskDueDate = new Date(task.dueDate);
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);
        
        if (task.priority === 'High') {
            return {
                text: 'High Priority',
                class: 'bg-red-100 text-red-800'
            };
        } else if (taskDueDate <= threeDaysFromNow && taskDueDate >= today) {
            return {
                text: 'Due Soon',
                class: 'bg-orange-100 text-orange-800'
            };
        } else if (task.subtasks && task.subtasks.length >= 3) {
            return {
                text: 'Complex Task',
                class: 'bg-purple-100 text-purple-800'
            };
        }
        return null;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold">High Priority Tasks</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex-1">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : groupedTasks.length > 0 ? (
                        <div className="space-y-4">
                            {groupedTasks.map((project) => (
                                <div 
                                    key={project.project_id}
                                    className="border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
                                >
                                    <button
                                        onClick={() => toggleProject(project.project_id)}
                                        className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{project.project_name}</h3>
                                            <span className="text-sm text-gray-500">
                                                ({project.tasks.length} tasks)
                                            </span>
                                        </div>
                                        <div 
                                            className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-500 transition-transform duration-300 ${
                                                expandedProjects.has(project.project_id) ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    <div
                                        className={`transition-all duration-300 ease-in-out ${
                                            expandedProjects.has(project.project_id)
                                                ? 'max-h-[2000px] opacity-100'
                                                : 'max-h-0 opacity-0 overflow-hidden'
                                        }`}
                                    >
                                        <div className="p-4 space-y-3">
                                            {project.tasks.map((task) => {
                                                const priorityBadge = getPriorityBadge(task);
                                                return (
                                                    <div
                                                        key={task.task_id}
                                                        className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow duration-200"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium">{task.title}</h4>
                                                            <div className="flex gap-2">
                                                                {priorityBadge && (
                                                                    <span className={`px-2 py-1 text-xs rounded-full ${priorityBadge.class}`}>
                                                                        {priorityBadge.text}
                                                                    </span>
                                                                )}
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}>
                                                                    {task.priority}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                                        
                                                        {task.subtasks && task.subtasks.length > 0 && (
                                                            <div className="mt-3">
                                                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                                    Subtasks ({task.subtasks.length}):
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {task.subtasks.map((subtask, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="flex items-center gap-2 text-sm"
                                                                        >
                                                                            <div className={`w-2 h-2 rounded-full ${
                                                                                subtask.status === 'Completed' ? 'bg-green-500' :
                                                                                subtask.status === 'In Progress' ? 'bg-blue-500' :
                                                                                'bg-gray-500'
                                                                            }`} />
                                                                            <span>{subtask.title}</span>
                                                                            {subtask.dueDate && (
                                                                                <span className="text-gray-500 text-xs">
                                                                                    Due: {new Date(subtask.dueDate).toLocaleDateString()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                                                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                            <span>Status: {task.status}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No high priority tasks found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const Tasks = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAllTasksModalOpen, setIsAllTasksModalOpen] = useState(false);
    const [isCompletedTasksModalOpen, setIsCompletedTasksModalOpen] = useState(false);
    const [isInProgressTasksModalOpen, setIsInProgressTasksModalOpen] = useState(false);
    const [isHighPriorityTasksModalOpen, setIsHighPriorityTasksModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userData, BASE_URL } = useUser();

    // Add debugging for initial render
    useEffect(() => {
        console.log("Tasks component mounted");
    }, []);

    // Debug modal state changes
    useEffect(() => {
        console.log("Modal state changed:", isAllTasksModalOpen);
    }, [isAllTasksModalOpen]);

    const handleOpenAllTasksModal = () => {
        console.log("Opening All Tasks Modal");
        setIsAllTasksModalOpen(true);
    };

    // Fetch tasks from API
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching tasks from:', `${BASE_URL}/tasks/get-tasks`);
                console.log('Request payload:', {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });

                const response = await axiosInstance.post(`${BASE_URL}/tasks/get-tasks`, {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });
                
                console.log('API Response:', response.data);
                
                if (response.data.success) {
                    const tasksData = response.data.data || [];
                    setTasks(tasksData);
                    console.log('Tasks fetched successfully:', tasksData.length, 'tasks');
                } else {
                    console.error('API Error:', response.data.message);
                    toast.error(response.data.message || "Failed to fetch tasks");
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
                console.error("Error details:", {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                toast.error("Failed to fetch tasks. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        if (userData.organization_id && userData.user_id) {
            fetchTasks();
        } else {
            console.log('Missing required data:', {
                hasOrgId: !!userData.organization_id,
                hasUserId: !!userData.user_id
            });
        }
    }, [userData.organization_id, userData.user_id, BASE_URL]);

    const handleUpdateTask = (updatedTask) => {
        setTasks(prev => prev.map(task => 
            task.task_id === updatedTask.task_id ? updatedTask : task
        ));
    };

    // Filter tasks for today's section (due today or overdue)
    const todaysTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDueDate = new Date(taskDate);
        taskDueDate.setHours(0, 0, 0, 0);
        
        // Check if task is due today or overdue
        return (taskDueDate.getTime() === today.getTime() || taskDate < today) && task.status !== 'Completed';
    });

    // Filter tasks for upcoming section (due after today)
    const upcomingTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDueDate = new Date(taskDate);
        taskDueDate.setHours(0, 0, 0, 0);
        
        // Only include tasks due after today
        return taskDueDate > today && task.status !== 'Completed';
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Filter completed tasks
    const completedTasks = tasks.filter(task => task.status === 'Completed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleAddTask = (newTask) => {
        setTasks(prev => [
            ...prev,
            {
                ...newTask,
                project: { title: newTask.project }
            }
        ]);
    };

    const openTaskDetails = (task) => {
        setSelectedTask(task);
        setIsDetailsModalOpen(true);
    };

    // Check if a task is overdue
    const isOverdue = (dueDate) => {
        const taskDate = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return taskDate < today;
    };

    // Calculate statistics for charts
    const projectStats = tasks.reduce((acc, task) => {
        const projectName = typeof task.project === 'object' ? task.project.title : task.project;
        if (!acc[projectName]) {
            acc[projectName] = {
                name: projectName,
                total: 0,
                completed: 0,
                pending: 0,
                inProgress: 0
            };
        }
        acc[projectName].total += 1;
        if (task.status === 'Completed') acc[projectName].completed += 1;
        else if (task.status === 'In Progress') acc[projectName].inProgress += 1;
        else acc[projectName].pending += 1;
        return acc;
    }, {});

    const chartData = Object.values(projectStats);
    const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'];

    const getProjectMetrics = () => {
        const metrics = tasks.reduce((acc, task) => {
            const projectName = typeof task.project === 'object' ? task.project.title : task.project;
            if (!acc[projectName]) {
                acc[projectName] = {
                    name: projectName,
                    completion: 0,
                    priority: 0,
                    efficiency: 0,
                    complexity: 0
                };
            }
            
            // Calculate metrics
            acc[projectName].completion += task.status === 'Completed' ? 100 : task.status === 'In Progress' ? 50 : 0;
            acc[projectName].priority += task.priority === 'High' ? 100 : task.priority === 'Medium' ? 50 : 25;
            acc[projectName].efficiency += task.subtasks?.length ? (task.status === 'Completed' ? 100 : 50) : 75;
            acc[projectName].complexity += task.subtasks?.length * 20;
            
            return acc;
        }, {});

        return Object.entries(metrics).map(([name, values]) => ({
            ...values,
            name,
            completion: values.completion / tasks.length,
            priority: values.priority / tasks.length,
            efficiency: values.efficiency / tasks.length,
            complexity: Math.min(100, values.complexity)
        }));
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Tasks Dashboard</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-500 hover:bg-green-600 transition-colors text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg"
                >
                    <Plus size={20} />
                    Add Task
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div 
                    className="p-6 bg-blue-50 border-2 border-blue-100 cursor-pointer hover:shadow-lg transition-shadow rounded-lg"
                    onClick={handleOpenAllTasksModal}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-medium">Total Tasks</p>
                            <h3 className="text-2xl font-bold text-blue-800">{tasks.length}</h3>
                        </div>
                        <BarChart3 className="text-blue-500" size={24} />
                    </div>
                </div>
                <div 
                    className="p-6 bg-green-50 border-2 border-green-100 cursor-pointer hover:shadow-lg transition-shadow rounded-lg"
                    onClick={() => setIsCompletedTasksModalOpen(true)}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Completed</p>
                            <h3 className="text-2xl font-bold text-green-800">
                                {tasks.filter(t => t.status === 'Completed').length}
                            </h3>
                        </div>
                        <CheckCircle className="text-green-500" size={24} />
                    </div>
                </div>
                <div 
                    className="p-6 bg-yellow-50 border-2 border-yellow-100 cursor-pointer hover:shadow-lg transition-shadow rounded-lg"
                    onClick={() => setIsInProgressTasksModalOpen(true)}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-600 text-sm font-medium">In Progress</p>
                            <h3 className="text-2xl font-bold text-yellow-800">
                                {tasks.filter(t => t.status === 'In Progress' || t.status === 'Not Started').length}
                            </h3>
                        </div>
                        <Clock className="text-yellow-500" size={24} />
                    </div>
                </div>
                <div 
                    className="p-6 bg-red-50 border-2 border-red-100 cursor-pointer hover:shadow-lg transition-shadow rounded-lg"
                    onClick={() => setIsHighPriorityTasksModalOpen(true)}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-600 text-sm font-medium">High Priority</p>
                            <h3 className="text-2xl font-bold text-red-800">
                                {tasks.filter(t => {
                                    const taskDueDate = new Date(t.dueDate);
                                    const today = new Date();
                                    const threeDaysFromNow = new Date();
                                    threeDaysFromNow.setDate(today.getDate() + 3);
                                    const isHighPriority = t.priority === 'High';
                                    const isDueSoon = taskDueDate <= threeDaysFromNow && taskDueDate >= today;
                                    const hasManySubtasks = t.subtasks && t.subtasks.length >= 3;
                                    return isHighPriority || isDueSoon || hasManySubtasks;
                                }).length}
                            </h3>
                        </div>
                        <TrendingUp className="text-red-500" size={24} />
                    </div>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 gap-6 mb-6">
                {/* Today's and Upcoming Tasks Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Tasks */}
                <Card className="p-6 col-span-1 bg-white shadow-xl border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="text-blue-500" size={20} />
                        Today's Tasks
                    </h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : todaysTasks.length > 0 ? (
                                todaysTasks.map((task) => (
                            <div 
                                key={task.task_id} 
                                        className={`flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 ${isOverdue(task.dueDate) ? 'border-l-4 border-red-500' : ''}`}
                                onClick={() => openTaskDetails(task)}
                            >
                                <button className="mt-1">
                                    {task.status === 'Completed' ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                    ) : task.status === 'In Progress' ? (
                                        <Clock className="text-blue-500" size={20} />
                                    ) : (
                                        <Circle className="text-gray-400" size={20} />
                                    )}
                                </button>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">{task.title}</h3>
                                            <p className="text-sm text-gray-500">{task.description}</p>
                                        </div>
                                                <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {task.priority}
                                                        {/* {console.log("task.priority",task.priority)} */}
                                        </span>
                                                    {isOverdue(task.dueDate) && (
                                                        <span className="flex items-center text-xs text-red-500">
                                                            <AlertTriangle size={12} className="mr-1" />
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                                <span>Project: { task.project.title }</span>
                                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        {task.subtasks?.length > 0 && (
                                            <span>Subtasks: {task.subtasks.length}</span>
                                        )}

                                                {/* {console.log("project title",task.project.title)}
                                                {console.log("due data",task.dueDate)}
                                                {console.log("subtasks length",task.subtasks.length)} */}
                                    </div>
                                </div>
                            </div>
                                ))
                            ) : (
                            <p className="text-gray-500 text-center py-4">No tasks for today</p>
                        )}
                    </div>
                </Card>

                {/* Upcoming Tasks */}
                <Card className="p-6 col-span-1 bg-white shadow-xl border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock className="text-yellow-500" size={20} />
                        Upcoming Tasks
                    </h2>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : upcomingTasks.length > 0 ? (
                                upcomingTasks.map((task) => (
                            <div 
                                key={task.task_id} 
                                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                onClick={() => openTaskDetails(task)}
                            >
                                <div className="mt-1">
                                    {task.status === 'Completed' ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                    ) : task.status === 'In Progress' ? (
                                        <Clock className="text-blue-500" size={20} />
                                    ) : (
                                        <Circle className="text-gray-400" size={20} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">{task.title}</h3>
                                            <p className="text-sm text-gray-500">{task.description}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {task.priority}
                                                    {/* {console.log("task.priority",task.priority)} */}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                                <span>Project: {typeof task.project === 'object' ? task.project.title : task.project}</span>
                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        {task.subtasks?.length > 0 && (
                                            <span>Subtasks: {task.subtasks.length}</span>
                                        )}
                                                {/* {console.log("task",task)} */}
                                                {/* {console.log("project title",task.project.title)}
                                                {console.log("due data",task.dueDate)}
                                                {console.log("subtasks length",task.subtasks.length)} */}
                                    </div>
                                </div>
                            </div>
                                ))
                            ) : (
                            <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
                        )}
                    </div>
                </Card>
                </div>

                {/* Completed Tasks Row */}
                <div className="grid grid-cols-1 gap-6">
                {/* Completed Tasks */}
                <Card className="p-6 col-span-1 bg-white shadow-xl border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={20} />
                        Completed Tasks
                    </h2>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : completedTasks.length > 0 ? (
                                completedTasks.map((task) => (
                            <div 
                                key={task.task_id} 
                                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                onClick={() => openTaskDetails(task)}
                            >
                                <div className="mt-1">
                                    <CheckCircle className="text-green-500" size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">{task.title}</h3>
                                            <p className="text-sm text-gray-500">{task.description}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {task.priority}
                                                    {/* {console.log("task.priority",task.priority)} */}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                                    <span>Project: {typeof task.project === 'object' ? task.project.title : task.project}</span>
                                                    <span>Completed: {new Date(task.createdAt).toLocaleDateString()}</span>
                                        {task.subtasks?.length > 0 && (
                                            <span>Subtasks: {task.subtasks.length}</span>
                                        )}
                                                    {/* {console.log("project title",task.project.title)}
                                                    {console.log("due data",task.dueDate)}
                                                    {console.log("subtasks length",task.subtasks.length)} */}
                                    </div>
                                </div>
                            </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No completed tasks</p>
                        )}
                    </div>
                </Card>
                </div>
            </div>

            {/* Advanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Project Performance Radar Chart */}
                <Card className="p-6 bg-white shadow-xl border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4">Project Performance Matrix</h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={150} data={getProjectMetrics()}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="name" stroke="#64748b" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar
                                    name="Completion"
                                    dataKey="completion"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.5}
                                />
                                <Radar
                                    name="Priority"
                                    dataKey="priority"
                                    stroke="#3B82F6"
                                    fill="#3B82F6"
                                    fillOpacity={0.5}
                                />
                                <Radar
                                    name="Efficiency"
                                    dataKey="efficiency"
                                    stroke="#F59E0B"
                                    fill="#F59E0B"
                                    fillOpacity={0.5}
                                />
                                <Legend />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Task Distribution Area Chart */}
                <Card className="p-6 bg-white shadow-xl border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4">Task Distribution Analysis</h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    fill="#10B981"
                                    stroke="#059669"
                                    fillOpacity={0.8}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#6366F1"
                                    strokeWidth={2}
                                    dot={{ fill: '#6366F1', r: 6 }}
                                />
                                <Scatter
                                    dataKey="inProgress"
                                    fill="#F59E0B"
                                    r={8}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Task Complexity Analysis */}
            <Card className="p-6 bg-white shadow-xl border border-gray-100 mb-6">
                <h2 className="text-lg font-semibold mb-4">Task Complexity Analysis</h2>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getProjectMetrics()}>
                            <defs>
                                <linearGradient id="complexityGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="complexity"
                                stroke="#6366F1"
                                fillOpacity={1}
                                fill="url(#complexityGradient)"
                            />
                            <Line
                                type="monotone"
                                dataKey="efficiency"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                dot={{ fill: '#F59E0B', r: 6 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Modals */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddTask}
            />
            <TaskDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedTask(null);
                }}
                task={selectedTask}
                onUpdate={handleUpdateTask}
            />
            <AllTasksModal
                isOpen={isAllTasksModalOpen}
                onClose={() => setIsAllTasksModalOpen(false)}
            />
            <CompletedTasksModal
                isOpen={isCompletedTasksModalOpen}
                onClose={() => setIsCompletedTasksModalOpen(false)}
            />
            <InProgressTasksModal
                isOpen={isInProgressTasksModalOpen}
                onClose={() => setIsInProgressTasksModalOpen(false)}
            />
            <HighPriorityTasksModal
                isOpen={isHighPriorityTasksModalOpen}
                onClose={() => setIsHighPriorityTasksModalOpen(false)}
            />
        </div>
    );
};

export default Tasks; 