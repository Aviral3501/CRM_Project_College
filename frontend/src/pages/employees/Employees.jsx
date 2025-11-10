import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Plus, Search, Mail, Phone, MapPin, Building, BarChart2, Trash2, X, AlertTriangle, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import axiosInstance from '../../api/axios';

const AnalyticsSection = ({ employees }) => {
    // Data preparation functions
    const getDepartmentDistribution = () => {
        const deptCount = employees.reduce((acc, emp) => {
            acc[emp.department] = (acc[emp.department] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(deptCount).map(([name, value]) => ({ name, value }));
    };

    const getStatusMetrics = () => {
        const statusCount = employees.reduce((acc, emp) => {
            acc[emp.status] = (acc[emp.status] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
    };

    const getLocationDistribution = () => {
        const locationCount = employees.reduce((acc, emp) => {
            acc[emp.location] = (acc[emp.location] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(locationCount).map(([name, count]) => ({ 
            name, 
            count 
        }));
    };

    const getDepartmentPerformance = () => {
        const deptMetrics = employees.reduce((acc, emp) => {
            if (!acc[emp.department]) {
                acc[emp.department] = {
                    name: emp.department,
                    employeeCount: 0,
                    activeRate: 0,
                    seniorityScore: 0
                };
            }
            acc[emp.department].employeeCount++;
            acc[emp.department].activeRate += emp.status === 'active' ? 1 : 0;
            acc[emp.department].seniorityScore += emp.title.toLowerCase().includes('senior') ? 1 : 0;
            return acc;
        }, {});

        return Object.values(deptMetrics).map(dept => ({
            ...dept,
            activeRate: (dept.activeRate / dept.employeeCount) * 100,
            seniorityScore: (dept.seniorityScore / dept.employeeCount) * 100
        }));
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12"
        >
            <h2 className="text-2xl font-bold mb-8">Employee Analytics Dashboard</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Distribution Chart */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getDepartmentDistribution()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {getDepartmentDistribution().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Employee Status Chart */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-lg font-semibold mb-4">Employee Status Overview</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getStatusMetrics()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#82ca9d" name="Employee Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Department Performance Radar */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-lg font-semibold mb-4">Department Performance Metrics</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={90} data={getDepartmentPerformance()}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="name" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Active Rate" dataKey="activeRate" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Radar name="Seniority Score" dataKey="seniorityScore" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                <Legend />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Geographical Distribution */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-lg font-semibold mb-4">Geographical Distribution</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getLocationDistribution()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const AddEmployeeModal = ({ isOpen, onClose, onAdd }) => {
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        title: '',
        department: '',
        email: '',
        password: '',
        phone: '',
        location: '',
        status: 'active'
    });

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setNewEmployee({
                name: '',
                title: '',
                department: '',
                email: '',
                password: '',
                phone: '',
                location: '',
                status: 'active'
            });
        }
    }, [isOpen]);

    // Update password when email changes
    useEffect(() => {
        setNewEmployee(prev => ({
            ...prev,
            password: prev.email
        }));
    }, [newEmployee.email]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(newEmployee);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Employee</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={newEmployee.name}
                                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        value={newEmployee.title}
                                        onChange={(e) => setNewEmployee({...newEmployee, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        value={newEmployee.department}
                                        onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={newEmployee.email}
                                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={newEmployee.password}
                                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                                />
                                <p className="text-xs text-gray-500 mt-1">Default password is same as email</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={newEmployee.phone}
                                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={newEmployee.location}
                                    onChange={(e) => setNewEmployee({...newEmployee, location: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={newEmployee.status}
                                    onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                                >
                                    Add Employee
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const EditEmployeeModal = ({ isOpen, onClose, onUpdate, employee }) => {
    const [editedEmployee, setEditedEmployee] = useState({
        name: '',
        title: '',
        department: '',
        email: '',
        phone: '',
        location: '',
        status: '',
     
    });

    // Reset and prefill form when modal opens or employee changes
    useEffect(() => {
        if (isOpen && employee) {
            setEditedEmployee({
                name: employee.name || '',
                title: employee.title || '',
                department: employee.department || '',
                email: employee.email || '',
                phone: employee.phone || '',
                location: employee.location || '',
                status: employee.status || 'active',
             
            });
        }
    }, [isOpen, employee]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setEditedEmployee({
                name: '',
                title: '',
                department: '',
                email: '',
                phone: '',
                location: '',
                status: '',
              
            });
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({
            ...editedEmployee,
            user_id: employee.user_id
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Edit Employee</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={editedEmployee.name}
                                    onChange={(e) => setEditedEmployee({...editedEmployee, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    disabled
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                                    value={editedEmployee.email}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={editedEmployee.title}
                                    onChange={(e) => setEditedEmployee({...editedEmployee, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={editedEmployee.department}
                                    onChange={(e) => setEditedEmployee({...editedEmployee, department: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={editedEmployee.phone}
                                    onChange={(e) => setEditedEmployee({...editedEmployee, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={editedEmployee.location}
                                    onChange={(e) => setEditedEmployee({...editedEmployee, location: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    value={editedEmployee.status}
                                    onChange={(e) => setEditedEmployee({...editedEmployee, status: e.target.value})}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                          
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                                >
                                    Update Employee
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const RemoveEmployeeModal = ({ isOpen, onClose, employee, onProceed }) => {
    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Any cleanup needed
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Remove Employee</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-lg">{employee?.name}</h3>
                                <p className="text-gray-600">{employee?.title}</p>
                                <div className="mt-2 space-y-2">
                                    <p className="text-sm text-gray-600">Department: {employee?.department}</p>
                                    <p className="text-sm text-gray-600">Email: {employee?.email}</p>
                                    <p className="text-sm text-gray-600">Join Date: {employee?.joinDate}</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onProceed}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                                >
                                    Proceed to Remove
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, employee }) => {
    const [confirmText, setConfirmText] = useState('');
    
    // Reset confirm text when modal closes
    useEffect(() => {
        if (!isOpen) {
            setConfirmText('');
        }
    }, [isOpen]);

    const handleClose = () => {
        setConfirmText('');
        onClose();
    };

    const handleConfirm = () => {
        setConfirmText('');
        onConfirm();
    };
    
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6"
                    >
                        <div className="flex items-center justify-center text-red-500 mb-4">
                            <AlertTriangle size={48} />
                        </div>
                        <h3 className="text-lg font-bold text-center mb-2">Confirm Employee Removal</h3>
                        <p className="text-gray-600 text-center mb-6">
                            This action cannot be undone. Please type <span className="font-semibold text-red-600">{employee?.name}</span> to confirm removal.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type employee name to confirm"
                                className="w-full p-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            />

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={confirmText !== employee?.name}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 
                                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    Remove Employee
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [removeEmployee, setRemoveEmployee] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { userData, BASE_URL } = useUser();

    // Log when component mounts and when BASE_URL changes
    useEffect(() => {
        console.log('Employees component mounted with BASE_URL:', BASE_URL);
        console.log('Current user data:', userData);
    }, [BASE_URL, userData]);

    // Fetch employees from API
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching employees from:', `${BASE_URL}/employees/get-employees`);
                console.log('Request payload:', {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });

                const response = await axiosInstance.post(`${BASE_URL}/employees/get-employees`, {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });
                
                console.log('API Response:', response.data);
                
                if (response.data.success) {
                    const employeesData = response.data.data || [];
                    setEmployees(employeesData);
                    console.log('Employees fetched successfully:', employeesData.length, 'employees');
                } else {
                    console.error('API Error:', response.data.message);
                    toast.error(response.data.message || "Failed to fetch employees");
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
                console.error("Error details:", {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                toast.error("Failed to fetch employees. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        if (userData.organization_id && userData.user_id) {
            fetchEmployees();
        } else {
            console.log('Missing required data:', {
                hasOrgId: !!userData.organization_id,
                hasUserId: !!userData.user_id
            });
        }
    }, [userData.organization_id, userData.user_id, BASE_URL]);

    const handleAddEmployee = async (newEmployee) => {
        try {
            console.log('Creating new employee:', newEmployee);
            const response = await axiosInstance.post(`${BASE_URL}/employees/create-employee`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                name: newEmployee.name,
                email: newEmployee.email,
                password: newEmployee.password,
                title: newEmployee.title,
                department: newEmployee.department,
                phone: newEmployee.phone,
                location: newEmployee.location
            });

            if (response.data.success) {
                // Refresh the employees list
                const updatedResponse = await axiosInstance.post(`${BASE_URL}/employees/get-employees`, {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });
                
                if (updatedResponse.data.success) {
                    setEmployees(updatedResponse.data.data || []);
                }
                
                toast.success("Employee added successfully");
                setIsAddModalOpen(false);
            } else {
                toast.error(response.data.message || "Failed to add employee");
            }
        } catch (error) {
            console.error("Error adding employee:", error);
            toast.error(error.response?.data?.message || "Failed to add employee. Please try again.");
        }
    };

    const handleEditClick = (employee) => {
        setSelectedEmployee(employee);
        setIsEditModalOpen(true);
    };

    const handleRemoveClick = (employee) => {
        setRemoveEmployee(employee);
    };

    const handleProceedToRemove = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmRemove = async () => {
        try {
            console.log('Removing employee:', removeEmployee);
            const response = await axiosInstance.post(`${BASE_URL}/employees/delete-employee`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                target_user_id: removeEmployee.user_id
            });

            if (response.data.success) {
                // Refresh the employees list
                const updatedResponse = await axiosInstance.post(`${BASE_URL}/employees/get-employees`, {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });
                
                if (updatedResponse.data.success) {
                    setEmployees(updatedResponse.data.data || []);
                }
                
                toast.success("Employee removed successfully");
                // Reset all states
                setShowConfirmDialog(false);
                setRemoveEmployee(null);
                setSelectedEmployee(null);
                setIsEditModalOpen(false);
            } else {
                toast.error(response.data.message || "Failed to remove employee");
            }
        } catch (error) {
            console.error("Error removing employee:", error);
            toast.error(error.response?.data?.message || "Failed to remove employee. Please try again.");
        }
    };

    const handleUpdateEmployee = async (updatedEmployee) => {
        try {
            console.log('Updating employee:', updatedEmployee);
            const response = await axiosInstance.post(`${BASE_URL}/employees/update-employee`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                target_user_id: updatedEmployee.user_id,
                name: updatedEmployee.name,
                title: updatedEmployee.title,
                department: updatedEmployee.department,
                phone: updatedEmployee.phone,
                location: updatedEmployee.location,
                status: updatedEmployee.status,
            });

            if (response.data.success) {
                // Refresh the employees list
                const updatedResponse = await axiosInstance.post(`${BASE_URL}/employees/get-employees`, {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });
                
                if (updatedResponse.data.success) {
                    setEmployees(updatedResponse.data.data || []);
                }
                
                toast.success("Employee updated successfully");
            } else {
                toast.error(response.data.message || "Failed to update employee");
            }
        } catch (error) {
            console.error("Error updating employee:", error);
            toast.error(error.response?.data?.message || "Failed to update employee. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Employees</h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
                >
                    <Plus size={20} />
                    Add Employee
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : employees.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">No employees found. Add your first employee to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employees.map((employee) => (
                        <Card key={employee.user_id} className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xl font-semibold text-gray-600">
                                        {employee.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{employee.name}</h3>
                                    <p className="text-sm text-gray-500">{employee.title}</p>
                                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                        employee.status === 'active' ? 'bg-green-100 text-green-800' : 
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {employee.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Building size={16} className="mr-2" />
                                    {employee.department || 'Not specified'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail size={16} className="mr-2" />
                                    {employee.email}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone size={16} className="mr-2" />
                                    {employee.phone || 'Not specified'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin size={16} className="mr-2" />
                                    {employee.location || 'Not specified'}
                                </div>
                            </div>



                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    onClick={() => handleEditClick(employee)}
                                    className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
                                >
                                    <Pencil size={20} />
                                </button>
                                <button
                                    onClick={() => handleRemoveClick(employee)}
                                    className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

                        {/* Add Analytics Section */}
                        {!isLoading && employees.length > 0 && (
                <AnalyticsSection employees={employees} />
            )}

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddEmployee}
            />

            <EditEmployeeModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEmployee(null);
                }}
                onUpdate={handleUpdateEmployee}
                employee={selectedEmployee}
            />

            <RemoveEmployeeModal
                isOpen={!!removeEmployee}
                onClose={() => setRemoveEmployee(null)}
                employee={removeEmployee}
                onProceed={handleProceedToRemove}
            />

            <ConfirmationDialog
                isOpen={showConfirmDialog}
                onClose={() => {
                    setShowConfirmDialog(false);
                    setRemoveEmployee(null);
                }}
                employee={removeEmployee}
                onConfirm={handleConfirmRemove}
            />
        </div>
    );
};

export default Employees; 