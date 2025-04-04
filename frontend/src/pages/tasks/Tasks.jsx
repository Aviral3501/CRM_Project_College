import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Plus, Calendar, Clock, CheckCircle, Circle, X, BarChart3, PieChart, TrendingUp } from 'lucide-react';
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

const TaskModal = ({ isOpen, onClose, onSubmit }) => {
    const initialFormState = {
        title: '',
        description: '',
        priority: 'Medium',
        project: '',
        status: 'Pending',
        dueDate: new Date().toISOString().split('T')[0],
        subtasks: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [newSubtask, setNewSubtask] = useState('');
    const [errors, setErrors] = useState({});

    const priorities = ['Low', 'Medium', 'High'];
    const statuses = ['Pending', 'In Progress', 'Completed'];
    const projectOptions = ['Website Redesign', 'Payment System', 'Auth System', 'Team Management']; // Demo projects

    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormState);
            setNewSubtask('');
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setFormData(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, { title: newSubtask.trim() }]
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.project) newErrors.project = 'Project is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            ...formData,
            task_id: `TSK${Date.now()}`, // Generate temporary ID
            createdAt: new Date()
        });
        onClose();
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
                            >
                                <option value="">Select Project</option>
                                {projectOptions.map(project => (
                                    <option key={project} value={project}>{project}</option>
                                ))}
                            </select>
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
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-md"
                        >
                            Create Task
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
        project: '',
        status: 'Pending',
        dueDate: new Date().toISOString().split('T')[0],
        subtasks: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [newSubtask, setNewSubtask] = useState('');

    const priorities = ['Low', 'Medium', 'High'];
    const statuses = ['Pending', 'In Progress', 'Completed'];
    const projectOptions = ['Website Redesign', 'Payment System', 'Auth System', 'Team Management'];

    useEffect(() => {
        if (task && isOpen) {
            setFormData({
                ...task,
                project: task.project.title,
                subtasks: task.subtasks || []
            });
        } else if (!isOpen) {
            setFormData(initialFormState);
            setNewSubtask('');
        }
    }, [task, isOpen]);

    if (!isOpen || !task) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setFormData(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, { title: newSubtask.trim() }]
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({
            ...formData,
            project: { title: formData.project }
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
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
                                value={formData.project}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                {projectOptions.map(project => (
                                    <option key={project} value={project}>{project}</option>
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
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Tasks = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [tasks, setTasks] = useState([
        {
            task_id: "TSK000000001",
            title: "Website Redesign Homepage",
            description: "Create new homepage design with modern UI elements",
            priority: "High",
            status: "In Progress",
            project: {
                title: "Website Redesign"
            },
            createdAt: new Date(),
            subtasks: [
                { title: "Design mockup in Figma" },
                { title: "Get client approval" }
            ]
        },
        {
            task_id: "TSK000000002",
            title: "API Integration",
            description: "Integrate payment gateway API with error handling",
            priority: "High",
            status: "Pending",
            project: {
                title: "Payment System"
            },
            createdAt: new Date(Date.now() + 86400000), // Tomorrow
            subtasks: [
                { title: "Setup test environment" }
            ]
        },
        {
            task_id: "TSK000000003",
            title: "Bug Fix - Login Flow",
            description: "Fix user authentication issues in login process",
            priority: "Medium",
            status: "Completed",
            project: {
                title: "Auth System"
            },
            createdAt: new Date(),
            subtasks: []
        },
        {
            task_id: "TSK000000004",
            title: "Weekly Team Meeting",
            description: "Discuss project progress and upcoming milestones",
            priority: "Low",
            status: "Pending",
            project: {
                title: "Team Management"
            },
            createdAt: new Date(Date.now() + 172800000), // Day after tomorrow
            subtasks: []
        }
    ]);

    const handleUpdateTask = (updatedTask) => {
        setTasks(prev => prev.map(task => 
            task.task_id === updatedTask.task_id ? updatedTask : task
        ));
    };

    const todaysTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        return taskDate.toDateString() === today.toDateString() && 
               task.status !== 'Completed';
    });

    const upcomingTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return taskDate > today && task.status !== 'Completed';
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const completedTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        
        return task.status === 'Completed' && 
               taskDate >= threeDaysAgo && 
               taskDate <= today;
    }).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)); // Sort by most recent first

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

    // Calculate statistics for charts
    const projectStats = tasks.reduce((acc, task) => {
        const project = task.project.title;
        if (!acc[project]) {
            acc[project] = {
                name: project,
                total: 0,
                completed: 0,
                pending: 0,
                inProgress: 0
            };
        }
        acc[project].total += 1;
        if (task.status === 'Completed') acc[project].completed += 1;
        else if (task.status === 'In Progress') acc[project].inProgress += 1;
        else acc[project].pending += 1;
        return acc;
    }, {});

    const chartData = Object.values(projectStats);
    const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'];

    const getProjectMetrics = () => {
        const metrics = tasks.reduce((acc, task) => {
            const project = task.project.title;
            if (!acc[project]) {
                acc[project] = {
                    name: project,
                    completion: 0,
                    priority: 0,
                    efficiency: 0,
                    complexity: 0
                };
            }
            
            // Calculate metrics
            acc[project].completion += task.status === 'Completed' ? 100 : task.status === 'In Progress' ? 50 : 0;
            acc[project].priority += task.priority === 'High' ? 100 : task.priority === 'Medium' ? 50 : 25;
            acc[project].efficiency += task.subtasks?.length ? (task.status === 'Completed' ? 100 : 50) : 75;
            acc[project].complexity += task.subtasks?.length * 20;
            
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
                <Card className="p-6 bg-blue-50 border-2 border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-medium">Total Tasks</p>
                            <h3 className="text-2xl font-bold text-blue-800">{tasks.length}</h3>
                        </div>
                        <BarChart3 className="text-blue-500" size={24} />
                    </div>
                </Card>
                <Card className="p-6 bg-green-50 border-2 border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Completed</p>
                            <h3 className="text-2xl font-bold text-green-800">
                                {tasks.filter(t => t.status === 'Completed').length}
                            </h3>
                        </div>
                        <CheckCircle className="text-green-500" size={24} />
                    </div>
                </Card>
                <Card className="p-6 bg-yellow-50 border-2 border-yellow-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-600 text-sm font-medium">In Progress</p>
                            <h3 className="text-2xl font-bold text-yellow-800">
                                {tasks.filter(t => t.status === 'In Progress').length}
                            </h3>
                        </div>
                        <Clock className="text-yellow-500" size={24} />
                    </div>
                </Card>
                <Card className="p-6 bg-red-50 border-2 border-red-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-600 text-sm font-medium">High Priority</p>
                            <h3 className="text-2xl font-bold text-red-800">
                                {tasks.filter(t => t.priority === 'High').length}
                            </h3>
                        </div>
                        <TrendingUp className="text-red-500" size={24} />
                    </div>
                </Card>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Today's Tasks */}
                <Card className="p-6 col-span-1 bg-white shadow-xl border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="text-blue-500" size={20} />
                        Today's Tasks
                    </h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {todaysTasks.map((task) => (
                            <div 
                                key={task.task_id} 
                                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
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
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                        <span>Project: {task.project.title}</span>
                                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                        {task.subtasks?.length > 0 && (
                                            <span>Subtasks: {task.subtasks.length}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {todaysTasks.length === 0 && (
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
                        {upcomingTasks.map((task) => (
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
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        {task.subtasks?.length > 0 && (
                                            <span>Subtasks: {task.subtasks.length}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {upcomingTasks.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
                        )}
                    </div>
                </Card>

                {/* Completed Tasks */}
                <Card className="p-6 col-span-1 bg-white shadow-xl border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={20} />
                        Completed Tasks
                    </h2>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {completedTasks.map((task) => (
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
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                        <span>Project: {task.project.title}</span>
                                        <span>Completed: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        {task.subtasks?.length > 0 && (
                                            <span>Subtasks: {task.subtasks.length}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {completedTasks.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No tasks completed in the last 3 days</p>
                        )}
                    </div>
                </Card>
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

            {/* Keep existing modals */}
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
        </div>
    );
};

export default Tasks; 