import { useState, useEffect } from 'react';
import  Card  from '../../components/ui/Card';
import { Plus, Calendar, Users, Clock, MoreVertical, X } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ComposedChart, CartesianGrid, XAxis, YAxis, Bar, Line, Scatter } from 'recharts';

const employeeOptions = [
    { id: 1, name: 'John Doe', role: 'Frontend Developer' },
    { id: 2, name: 'Jane Smith', role: 'Backend Developer' },
    { id: 3, name: 'Mike Johnson', role: 'UI/UX Designer' },
    { id: 4, name: 'Sarah Wilson', role: 'Project Manager' },
    { id: 5, name: 'Alex Brown', role: 'Full Stack Developer' },
    { id: 6, name: 'Emily Davis', role: 'DevOps Engineer' }
];

const Projects = () => {
    const [projects, setProjects] = useState([
        {
            id: 1,
            name: 'Website Redesign',
            description: 'Complete overhaul of company website',
            status: 'In Progress',
            deadline: '2024-04-30',
            team: ['John Doe', 'Jane Smith'],
            progress: 65,
            priority: 'High'
        },
        {
            id: 2,
            name: 'Mobile App Development',
            description: 'New mobile app for customers',
            status: 'Planning',
            deadline: '2024-05-15',
            team: ['Mike Johnson', 'Sarah Wilson'],
            progress: 25,
            priority: 'Medium'
        },
        {
            id: 3,
            name: 'CRM Integration',
            description: 'Integrate new CRM system',
            status: 'Completed',
            deadline: '2024-03-30',
            team: ['Alex Brown', 'Emily Davis'],
            progress: 100,
            priority: 'High'
        }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const handleCreateProject = (newProject) => {
        setProjects(prev => [...prev, newProject]);
    };

    const handleUpdateProject = (updatedProject) => {
        setProjects(prev => prev.map(p => 
            p.id === updatedProject.id ? updatedProject : p
        ));
    };

    const handleDeleteProject = (projectId) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
    };

    // Advanced metrics calculations
    const getProjectMetrics = () => {
        return projects.map(project => {
            const taskCount = project.tasks?.length || 0;
            const completedTasks = project.tasks?.filter(t => t.status === 'Completed').length || 0;
            const criticalTasks = project.tasks?.filter(t => t.priority === 'High').length || 0;

            return {
                name: project.name,
                efficiency: taskCount ? (completedTasks / taskCount) * 100 : 0,
                complexity: project.tasks?.reduce((acc, task) => acc + (task.subtasks?.length || 0), 0) || 0,
                priority: project.priority === 'High' ? 100 : project.priority === 'Medium' ? 50 : 25,
                progress: project.progress,
                risk: (criticalTasks / taskCount) * 100 || 0,
                teamSize: project.team.length
            };
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projects</h1>
                <button 
                    onClick={() => {
                        setSelectedProject(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={20} />
                    New Project
                </button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Card key={project.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{project.name}</h3>
                                <p className="text-sm text-gray-500">{project.description}</p>
                            </div>
                            <div className="relative">
                                <button 
                                    onClick={() => {
                                        setSelectedProject(project);
                                        setIsModalOpen(true);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {project.status}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    project.priority === 'High' ? 'bg-red-100 text-red-800' :
                                    'bg-orange-100 text-orange-800'
                                }`}>
                                    {project.priority}
                                </span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar size={16} className="mr-2" />
                                Deadline: {new Date(project.deadline).toLocaleDateString()}
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                                <Users size={16} className="mr-2" />
                                Team: {project.team.join(', ')}
                            </div>

                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Project Performance Radar Chart */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Project Performance Matrix</h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={150} data={getProjectMetrics()}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="name" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar
                                    name="Progress"
                                    dataKey="progress"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.5}
                                />
                                <Radar
                                    name="Efficiency"
                                    dataKey="efficiency"
                                    stroke="#3B82F6"
                                    fill="#3B82F6"
                                    fillOpacity={0.5}
                                />
                                <Radar
                                    name="Risk"
                                    dataKey="risk"
                                    stroke="#EF4444"
                                    fill="#EF4444"
                                    fillOpacity={0.5}
                                />
                                <Legend />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Project Complexity Analysis */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Project Complexity Analysis</h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={getProjectMetrics()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    yAxisId="left"
                                    dataKey="complexity"
                                    fill="#8884d8"
                                    name="Task Complexity"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="teamSize"
                                    stroke="#82ca9d"
                                    name="Team Size"
                                />
                                <Scatter
                                    yAxisId="left"
                                    dataKey="priority"
                                    fill="#ff7300"
                                    name="Priority Level"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

           

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProject(null);
                }}
                onSubmit={(project) => {
                    if (selectedProject) {
                        handleUpdateProject(project);
                    } else {
                        handleCreateProject(project);
                    }
                }}
                project={selectedProject}
            />
        </div>
    );
};

const ProjectModal = ({ isOpen, onClose, onSubmit, project = null }) => {
    const initialFormState = {
        name: '',
        description: '',
        status: 'Planning',
        deadline: new Date().toISOString().split('T')[0],
        team: [],
        priority: 'Medium',
        tasks: [],
        progress: 0
    };

    const [formData, setFormData] = useState(initialFormState);
    const [newTask, setNewTask] = useState({ title: '', description: '', subtasks: [] });
    const [newSubtask, setNewSubtask] = useState('');
    const [errors, setErrors] = useState({});

    const statuses = ['Planning', 'In Progress', 'On Hold', 'Completed'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    useEffect(() => {
        if (project && isOpen) {
            setFormData(project);
        } else if (!isOpen) {
            setFormData(initialFormState);
            setNewTask({ title: '', description: '', subtasks: [] });
            setNewSubtask('');
            setErrors({});
        }
    }, [project, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleEmployeeToggle = (employee) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.includes(employee)
                ? prev.team.filter(e => e !== employee)
                : [...prev.team, employee]
        }));
    };

    const addTask = () => {
        if (newTask.title.trim()) {
            setFormData(prev => ({
                ...prev,
                tasks: [...prev.tasks, { ...newTask, id: Date.now() }]
            }));
            setNewTask({ title: '', description: '', subtasks: [] });
        }
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setNewTask(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, { title: newSubtask.trim() }]
            }));
            setNewSubtask('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Project name is required';
        if (!formData.deadline) newErrors.deadline = 'Deadline is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            ...formData,
            id: project?.id || Date.now()
        });
        onClose();
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${isOpen ? '' : 'hidden'}`}>
            <div className="bg-white rounded-lg w-full max-w-4xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-semibold">
                        {project ? 'Edit Project' : 'Create New Project'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deadline *
                            </label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-md ${errors.deadline ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>

                        <div className="col-span-2">
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
                    </div>

                    {/* Team Members */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Members
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {employeeOptions.map(employee => (
                                <div
                                    key={employee.id}
                                    className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.team.includes(employee.name)}
                                        onChange={() => handleEmployeeToggle(employee.name)}
                                        className="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <label className="flex-1">
                                        <div className="text-sm font-medium">{employee.name}</div>
                                        <div className="text-xs text-gray-500">{employee.role}</div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tasks
                        </label>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Task title"
                                    className="p-2 border border-gray-300 rounded-md"
                                />
                                <input
                                    type="text"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Task description"
                                    className="p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Subtasks */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    placeholder="Add subtask"
                                    className="flex-1 p-2 border border-gray-300 rounded-md"
                                />
                                <button
                                    type="button"
                                    onClick={addSubtask}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md"
                                >
                                    Add Subtask
                                </button>
                            </div>

                            {newTask.subtasks.length > 0 && (
                                <div className="pl-4 space-y-2">
                                    {newTask.subtasks.map((subtask, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span>• {subtask.title}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewTask(prev => ({
                                                        ...prev,
                                                        subtasks: prev.subtasks.filter((_, i) => i !== index)
                                                    }));
                                                }}
                                                className="text-red-500"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={addTask}
                                className="w-full py-2 bg-blue-500 text-white rounded-md"
                            >
                                Add Task
                            </button>

                            {/* Task List */}
                            <div className="space-y-2">
                                {formData.tasks.map((task, index) => (
                                    <div key={task.id} className="p-3 bg-gray-50 rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{task.title}</h4>
                                                <p className="text-sm text-gray-500">{task.description}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        tasks: prev.tasks.filter((_, i) => i !== index)
                                                    }));
                                                }}
                                                className="text-red-500"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        {task.subtasks.length > 0 && (
                                            <div className="mt-2 pl-4 space-y-1">
                                                {task.subtasks.map((subtask, idx) => (
                                                    <div key={idx} className="text-sm text-gray-600">
                                                        • {subtask.title}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
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
                            {project ? 'Save Changes' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Projects; 