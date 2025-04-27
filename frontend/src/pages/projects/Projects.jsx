import { useState, useEffect, useRef } from 'react';
import Card from '../../components/ui/Card';
import { Plus, Calendar, Users, Clock, MoreVertical, X, AlertTriangle, Edit2, Trash2, Search } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ComposedChart, CartesianGrid, XAxis, YAxis, Bar, Line, Scatter } from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { toast } from 'react-hot-toast';

const BASE_URL = 'http://localhost:5000/api';

// Employee Search Component
const EmployeeSearch = ({ onSelectEmployee, selectedEmployees }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const { userData } = useUser();
    const dropdownRef = useRef(null);

    // Fetch all employees when component mounts
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const response = await axios.post(`${BASE_URL}/employees/get-employees`, {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });

                if (response.data.success) {
                    setEmployees(response.data.data);
                } else {
                    toast.error("Failed to fetch employees");
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
                toast.error("Error fetching employees");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [userData.organization_id, userData.user_id]);

    // Filter employees based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredEmployees([]);
            setShowDropdown(false);
            return;
        }

        const filtered = employees.filter(employee =>
            (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
            !selectedEmployees.some(selected => selected.user_id === employee.user_id)
        );

        setFilteredEmployees(filtered);
        setShowDropdown(true);
    }, [searchTerm, employees, selectedEmployees]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectEmployee = (employee) => {
        onSelectEmployee(employee);
        setSearchTerm('');
        setShowDropdown(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search employees..."
                    className="w-full p-2 border border-gray-300 rounded-md pr-10"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            </div>

            {loading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2 text-center">
                    Loading employees...
                </div>
            )}

            {showDropdown && !loading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(employee => (
                            <div
                                key={employee.user_id}
                                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                onClick={() => handleSelectEmployee(employee)}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                                    {employee.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-medium">
                                        {employee.name}
                                        {employee.role === 'admin' && <span className="ml-1 text-xs text-blue-600">(Admin)</span>}
                                    </div>
                                    <div className="text-xs text-gray-500">{employee.title}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-gray-500 text-center">None found</div>
                    )}
                </div>
            )}
        </div>
    );
};

// Selected Team Members Component
const SelectedTeamMembers = ({ teamMembers, onRemoveMember }) => {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {teamMembers.map(member => (
                <div
                    key={member.user_id}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                    <span>{member.name}</span>
                    <button
                        onClick={() => onRemoveMember(member)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [deleteProject, setDeleteProject] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
    const { userData, BASE_URL } = useUser();

    // Fetch projects from the backend
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await axios.post(`${BASE_URL}/projects/get-projects`, {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });

                if (response.data.success) {
                    setProjects(response.data.data);
                } else {
                    setError("Failed to fetch projects");
                }
            } catch (err) {
                setError(err.message || "An error occurred while fetching projects");
                console.error("Error fetching projects:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [userData.organization_id, userData.user_id, BASE_URL]);

    const handleCreateProject = async (newProject) => {
        try {
            // Transform the project data to match the backend's expected format
            const projectPayload = {
                organization_id: newProject.organization_id || userData.organization_id,
                user_id: newProject.user_id || userData.user_id,
                project_title: newProject.name,
                project_description: newProject.description,
                project_status: newProject.status,
                project_priority: newProject.priority,
                project_dueDate: newProject.deadline,
                project_team: newProject.team
            };
            
            console.log('Sending project payload:', projectPayload);
            const response = await axios.post(`${BASE_URL}/projects/create-project`, projectPayload);
            
            if (response.data.success) {
                setProjects(prev => [...prev, response.data.data]);
                toast.success("Project created successfully");
                setSelectedTeamMembers([]);
            } else {
                setError("Failed to create project");
                toast.error("Failed to create project");
            }
        } catch (err) {
            console.error("Error creating project:", err);
            setError(err.message || "An error occurred while creating the project");
            toast.error("Error creating project");
        }
    };

    const handleUpdateProject = async (formData, project_id) => {
        try {
            console.log('formData:', formData);
            const teamUserObjects = formData.team; // Already full objects!
            console.log('teamUserObjects:', teamUserObjects);

            // Transform the project data to use the field names with "project_" prefix
            const projectPayload = {
                project_id: project_id,
                organization_id: formData.organization_id || userData.organization_id,
                user_id: formData.user_id || userData.user_id,
                project_title: formData.project_title,
                project_description: formData.project_description,
                project_status: formData.project_status,
                project_priority: formData.project_priority,
                project_dueDate: formData.project_dueDate,
                project_team: formData.project_team
            };
            console.log('Complete Project Payload (Update):', projectPayload);

            const response = await axios.post(`${BASE_URL}/projects/update-project`, projectPayload);

            if (response.data.success) {
                setProjects(prev => prev.map(p =>
                    p.project_id === response.data.data.project_id ? response.data.data : p
                ));
                toast.success("Project updated successfully");
            } else {
                setError("Failed to update project");
                toast.error("Failed to update project");
            }
        } catch (err) {
            setError(err.message || "An error occurred while updating the project");
            console.error("Error updating project:", err);
            toast.error("Error updating project");
        }
    };

    const handleDeleteProject = async (projectId) => {
        try {
            const response = await axios.post(`${BASE_URL}/projects/delete-project`, {
                project_id: projectId,
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                setProjects(prev => prev.filter(p => p.project_id !== projectId));
                toast.success("Project deleted successfully");
            } else {
                setError("Failed to delete project");
                toast.error("Failed to delete project");
            }
        } catch (err) {
            setError(err.message || "An error occurred while deleting the project");
            console.error("Error deleting project:", err);
            toast.error("Error deleting project");
        }
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

    const handleDeleteClick = (project) => {
        setDeleteProject(project);
    };

    const handleProceedToDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        handleDeleteProject(deleteProject.project_id);
        setShowDeleteConfirm(false);
        setDeleteProject(null);
    };

    // Add this useEffect to handle clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.project-menu')) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle team member selection
    const handleSelectTeamMember = (employee) => {
        if (!selectedTeamMembers.some(member => member.user_id === employee.user_id)) {
            setSelectedTeamMembers(prev => [...prev, employee]);
        }
    };

    // Handle team member removal
    const handleRemoveTeamMember = (employee) => {
        setSelectedTeamMembers(prev => prev.filter(member => member.user_id !== employee.user_id));
    };

    // Reset selected team members when modal is closed
    useEffect(() => {
        if (!isModalOpen) {
            setSelectedTeamMembers([]);
        }
    }, [isModalOpen]);

    // Set selected team members when editing a project
    useEffect(() => {
        if (selectedProject && isModalOpen) {
            // In a real app, you would fetch the full employee details here
            // For now, we'll just use the team member IDs from the project
            const teamMembers = selectedProject.team.map(memberId => ({
                user_id: memberId,
                name: `Employee ${memberId}` // This would be the actual name in a real app
            }));
            setSelectedTeamMembers(teamMembers);
        }
    }, [selectedProject, isModalOpen]);

    if (loading) {
        return <div className="p-6 text-center">Loading projects...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">Error: {error}</div>;
    }

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
                {projects.map((project,index) => (
                    <Card key={project.project_id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{project.name}</h3>
                                <p className="text-sm text-gray-500">{project.description}</p>
                            </div>
                            <div className="relative project-menu">
                                <button
                                    onClick={() => setOpenMenuId(openMenuId === project.project_id ? null : project.project_id)}
                                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <MoreVertical size={20} />
                                </button>
                                {openMenuId === project.project_id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                                    >
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setIsModalOpen(true);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <span className="text-gray-400">
                                                    <Edit2 size={16} />
                                                </span>
                                                Edit Project
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDeleteClick(project);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <span className="text-red-400">
                                                    <Trash2 size={16} />
                                                </span>
                                                Delete Project
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {project.status}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${project.priority === 'High' ? 'bg-red-100 text-red-800' :
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



            {isModalOpen && !selectedProject && (
                <AddProjectModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedProject(null);
                        setSelectedTeamMembers([]);
                    }}
                    onSubmit={handleCreateProject}
                    selectedTeamMembers={selectedTeamMembers}
                    setSelectedTeamMembers={setSelectedTeamMembers}
                />
            )}

            {isModalOpen && selectedProject && (
                <EditProjectModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedProject(null);
                    }}
                    onSubmit={handleUpdateProject}
                    project={selectedProject}
                />
            )}

            <DeleteProjectModal
                isOpen={!!deleteProject && !showDeleteConfirm}
                onClose={() => setDeleteProject(null)}
                project={deleteProject}
                onProceed={handleProceedToDelete}
            />

            <DeleteConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteProject(null);
                }}
                project={deleteProject}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

// Add Project Modal Component
const AddProjectModal = ({ isOpen, onClose, onSubmit, selectedTeamMembers, setSelectedTeamMembers }) => {
    const initialFormState = {
        name: '',
        description: '',
        status: 'Not Started',
        deadline: new Date().toISOString().split('T')[0],
        team: selectedTeamMembers,
        priority: 'Medium',
        tasks: [],
        progress: 0,
        project_id:""
    };

    const [formData, setFormData] = useState(initialFormState);
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '', subtasks: [] });
    const [newSubtask, setNewSubtask] = useState('');
    const [errors, setErrors] = useState({});
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { userData, BASE_URL } = useUser();

    const statuses = ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];

    // Update formData.team when selectedTeamMembers changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            team: selectedTeamMembers
        }));
    }, [selectedTeamMembers]);

    // Fetch employees when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }
    }, [isOpen]);

    // Filter employees based on search term
    useEffect(() => {
        if (searchTerm.trim().length < 3) {
            setFilteredEmployees([]);
            setShowDropdown(false);
            return;
        }

        const filtered = employees.filter(employee =>
            (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
            !formData.team.some(selected => selected.user_id === employee.user_id)
        );

        setFilteredEmployees(filtered);
        setShowDropdown(true);
    }, [searchTerm, employees, formData.team]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URL}/employees/get-employees`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                setEmployees(response.data.data);
            } else {
                toast.error("Failed to fetch employees");
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            toast.error("Error fetching employees");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSelectEmployee = (employee) => {
        setSelectedTeamMembers(prev => [...prev, employee]);
        setSearchTerm('');
        setShowDropdown(false);
    };

    useEffect(() => {
        console.log('Selected Team Members (updated):', selectedTeamMembers);
    }, [selectedTeamMembers]);

    const handleRemoveEmployee = (employee) => {
        setSelectedTeamMembers(prev => prev.filter(member => member.user_id !== employee.user_id));
    };

    const addTask = () => {
        if (newTask.title.trim()) {
            setFormData(prev => ({
                ...prev,
                tasks: [...prev.tasks, { ...newTask, id: Date.now() }]
            }));
            setNewTask({ title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '', subtasks: [] });
        }
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setNewTask(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, { title: newSubtask.trim(), status: 'Pending', dueDate: '', id: Date.now() }]
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

        // Create a simple project object with the required fields
        const projectData = {
            name: formData.name,
            description: formData.description,
            status: formData.status,
            deadline: formData.deadline,
            team: formData.team,
            priority: formData.priority,
            organization_id: userData.organization_id,
            user_id: userData.user_id
        };

        console.log('Submitting project:', projectData);
        onSubmit(projectData);
        onClose();
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${isOpen ? '' : 'hidden'}`}>
            <div className="bg-white rounded-lg w-full max-w-4xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-semibold">Create New Project</h2>
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
                            {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
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
                                {statuses.map((status, index) => (
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
                        <div className="relative" ref={dropdownRef}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search employees (type at least 3 characters)..."
                                    className="w-full p-2 border border-gray-300 rounded-md pr-10"
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                            </div>

                            {loading && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2 text-center">
                                    Loading employees...
                                </div>
                            )}

                            {showDropdown && !loading && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map((employee, index) => (
                                            <div
                                                key={employee.user_id}
                                                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                onClick={() => handleSelectEmployee(employee)}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                                                    {employee.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {employee.name}
                                                        {employee.role === 'admin' && <span className="ml-1 text-xs text-blue-600">(Admin)</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{employee.title}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-gray-500 text-center">None found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Team Members */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {formData.team.map((member, index) => (
                                <div
                                    key={member.user_id}
                                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                >
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2 text-xs">
                                        {member.name.charAt(0)}
                                    </div>
                                    <span>{member.name}</span>
                                    <button
                                        onClick={() => handleRemoveEmployee(member)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <X size={16} />
                                    </button>
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

                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={newTask.status}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value }))}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
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
                                        <div key={subtask.id || index} className="flex items-center gap-2">
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
                                    <div key={task.id || index} className="p-3 bg-gray-50 rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{task.title}</h4>
                                                <p className="text-sm text-gray-500">{task.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                            'bg-orange-100 text-orange-800'
                                                        }`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
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
                                                    <div key={subtask.id || idx} className="text-sm text-gray-600">
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
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Project Modal Component
const EditProjectModal = ({ isOpen, onClose, onSubmit, project }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Not Started',
        deadline: new Date().toISOString().split('T')[0],
        team: [],
        priority: 'Medium',
        tasks: [],
        progress: 0
    });
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '', subtasks: [] });
    const [newSubtask, setNewSubtask] = useState('');
    const [errors, setErrors] = useState({});
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { userData, BASE_URL } = useUser();

    const statuses = ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];

    // Fetch employees when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }
    }, [isOpen]);

    useEffect(() => {
        if (project && employees.length > 0) {
            // Map project.team (which may be names or user_ids) to full employee objects
            const teamMembers = (project.team || []).map(t =>
                // If t is already an object with user_id, return as is
                typeof t === 'object' && t.user_id
                    ? t
                    // If t is a string, find the employee by user_id or name
                    : employees.find(emp => emp.user_id === t || emp.name === t)
            ).filter(Boolean); // Remove any undefined
    
            setFormData({
                name: project.name || '',
                description: project.description || '',
                status: project.status || 'Not Started',
                deadline: project.deadline || new Date().toISOString().split('T')[0],
                team: teamMembers,
                priority: project.priority || 'Medium',
                tasks: project.tasks || [],
                progress: project.progress || 0
            });
        }
    }, [project, employees, isOpen]);

    // Update form data when project changes
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                status: project.status || 'Not Started',
                deadline: project.deadline || new Date().toISOString().split('T')[0],
                team: project.team || [],
                priority: project.priority || 'Medium',
                tasks: project.tasks || [],
                progress: project.progress || 0
            });
        }
    }, [project, isOpen]);

    // Filter employees based on search term
    useEffect(() => {
        if (searchTerm.trim().length < 3) {
            setFilteredEmployees([]);
            setShowDropdown(false);
            return;
        }

        const filtered = employees.filter(employee =>
            (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
            !formData.team.some(selected => selected.user_id === employee.user_id)
        );
        console.log('Filtered Employees:', filtered);

        setFilteredEmployees(filtered);
        console.log('Filtered Employees:', filtered);
        setShowDropdown(true);
    }, [searchTerm, employees, formData.team]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URL}/employees/get-employees`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                setEmployees(response.data.data);
            } else {
                toast.error("Failed to fetch employees");
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            toast.error("Error fetching employees");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSelectEmployee = (employee) => {
        setFormData(prev => ({
            ...prev,
            team: [...prev.team, employee]
        }));
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleRemoveEmployee = (employee) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.filter(member => member.user_id !== employee.user_id)
        }));
    };

    const addTask = () => {
        if (newTask.title.trim()) {
            setFormData(prev => ({
                ...prev,
                tasks: [...prev.tasks, { ...newTask, id: Date.now() }]
            }));
            setNewTask({ title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '', subtasks: [] });
        }
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setNewTask(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, { title: newSubtask.trim(), status: 'Pending', dueDate: '', id: Date.now() }]
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

        // Transform the form data to use the field names with "project_" prefix
        const transformedData = {
            project_title: formData.name,
            project_description: formData.description,
            project_status: formData.status,
            project_dueDate: formData.deadline,
            project_team: formData.team,
            project_priority: formData.priority,
            // tasks: formData.tasks,
            // progress: formData.progress,
            // project_id: project.project_id,
            organization_id: userData.organization_id,
            user_id: userData.user_id
        };

        console.log('Submitting project with team:', transformedData);
        onSubmit(transformedData, project.project_id);
        onClose();
    };

    useEffect(() => {
        console.log('Selected Team Members (EditProjectModal):', formData.team);
        console.log('form data:', formData);
    }, [formData]);

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${isOpen ? '' : 'hidden'}`}>
            <div className="bg-white rounded-lg w-full max-w-4xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-semibold">Edit Project</h2>
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
                            {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
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
                        <div className="relative" ref={dropdownRef}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search employees (type at least 3 characters)..."
                                    className="w-full p-2 border border-gray-300 rounded-md pr-10"
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                            </div>

                            {loading && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2 text-center">
                                    Loading employees...
                                </div>
                            )}

                            {showDropdown && !loading && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map(employee => (
                                            <div
                                                key={employee.user_id}
                                                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                onClick={() => handleSelectEmployee(employee)}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                                                    {employee.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {employee.name}
                                                        {employee.role === 'admin' && <span className="ml-1 text-xs text-blue-600">(Admin)</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{employee.title}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-gray-500 text-center">None found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Team Members */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {formData.team.map(member => (
                                <div
                                    key={member.user_id}
                                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                >
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2 text-xs">
                                        {member.name ? member.name.charAt(0) : '?'}
                                    </div>
                                    <span>{member.name || 'Unknown'}</span>
                                    <button
                                        onClick={() => handleRemoveEmployee(member)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <X size={16} />
                                    </button>
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

                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={newTask.status}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value }))}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
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
                                        <div key={subtask.id || index} className="flex items-center gap-2">
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
                                    <div key={task.id || index} className="p-3 bg-gray-50 rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{task.title}</h4>
                                                <p className="text-sm text-gray-500">{task.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                            'bg-orange-100 text-orange-800'
                                                        }`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
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
                                                    <div key={subtask.id || idx} className="text-sm text-gray-600">
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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delete Project Modal
const DeleteProjectModal = ({ isOpen, onClose, project, onProceed }) => {
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40 ${isOpen ? '' : 'hidden'}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg w-full max-w-lg p-6"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-red-600">Delete Project</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">{project?.name}</h3>
                        <p className="text-gray-600 mb-3">{project?.description}</p>

                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar size={16} className="mr-2" />
                                Deadline: {new Date(project?.deadline).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Users size={16} className="mr-2" />
                                Team: {project?.team.join(', ')}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${project?.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        project?.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {project?.status}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${project?.priority === 'High' ? 'bg-red-100 text-red-800' :
                                        'bg-orange-100 text-orange-800'
                                    }`}>
                                    {project?.priority}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onProceed}
                            className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                        >
                            Proceed to Delete
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({ isOpen, onClose, project, onConfirm }) => {
    const [confirmText, setConfirmText] = useState('');

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${isOpen ? '' : 'hidden'}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg w-full max-w-md p-6"
            >
                <div className="flex justify-center text-red-500 mb-4">
                    <AlertTriangle size={48} />
                </div>

                <h3 className="text-xl font-bold text-center mb-2">Confirm Project Deletion</h3>
                <p className="text-gray-600 text-center mb-6">
                    This action cannot be undone. Please type <span className="font-semibold">{project?.name}</span> to confirm deletion.
                </p>

                <div className="space-y-4">
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type project name to confirm"
                        className="w-full p-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm()}
                            disabled={confirmText !== project?.name}
                            className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete Project
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
export default Projects; 
