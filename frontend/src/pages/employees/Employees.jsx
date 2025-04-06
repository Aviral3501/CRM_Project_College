import { useState } from 'react';
import Card from '../../components/ui/Card';
import { Plus, Search, Mail, Phone, MapPin, Building, BarChart2, Trash2, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddEmployeeModal = ({ isOpen, onClose, onAdd }) => {
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        role: '',
        department: '',
        email: '',
        phone: '',
        location: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            ...newEmployee,
            id: Date.now(),
            status: 'Active',
            performance: 80,
            projects: [],
            joinDate: new Date().toISOString().split('T')[0]
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
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        value={newEmployee.role}
                                        onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
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

const RemoveEmployeeModal = ({ isOpen, onClose, employee, onProceed }) => {
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
                                <p className="text-gray-600">{employee?.role}</p>
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
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => onConfirm()}
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
    const [employees, setEmployees] = useState([
        {
            id: 1,
            name: 'John Doe',
            role: 'Senior Developer',
            department: 'Engineering',
            email: 'john@company.com',
            phone: '+1 234-567-8900',
            location: 'San Francisco, CA',
            status: 'Active',
            performance: 92,
            projects: ['Website Redesign', 'Mobile App'],
            joinDate: '2023-01-15'
        },
        {
            id: 2,
            name: 'Jane Smith',
            role: 'Project Manager',
            department: 'Management',
            email: 'jane@company.com',
            phone: '+1 234-567-8901',
            location: 'New York, NY',
            status: 'Active',
            performance: 88,
            projects: ['CRM Integration'],
            joinDate: '2023-03-20'
        },
        {
            id: 3,
            name: 'Mike Johnson',
            role: 'UI Designer',
            department: 'Design',
            email: 'mike@company.com',
            phone: '+1 234-567-8902',
            location: 'Austin, TX',
            status: 'On Leave',
            performance: 85,
            projects: ['Mobile App'],
            joinDate: '2023-06-10'
        }
    ]);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [removeEmployee, setRemoveEmployee] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const handleAddEmployee = (newEmployee) => {
        setEmployees([...employees, newEmployee]);
    };

    const handleRemoveClick = (employee) => {
        setRemoveEmployee(employee);
    };

    const handleProceedToRemove = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmRemove = () => {
        setEmployees(employees.filter(emp => emp.id !== removeEmployee.id));
        setShowConfirmDialog(false);
        setRemoveEmployee(null);
    };

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => (
                    <Card key={employee.id} className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xl font-semibold text-gray-600">
                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">{employee.name}</h3>
                                <p className="text-sm text-gray-500">{employee.role}</p>
                                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                    employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {employee.status}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <Building size={16} className="mr-2" />
                                {employee.department}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail size={16} className="mr-2" />
                                {employee.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone size={16} className="mr-2" />
                                {employee.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin size={16} className="mr-2" />
                                {employee.location}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Performance</span>
                                <span className="text-sm font-medium">{employee.performance}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${employee.performance}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
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

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddEmployee}
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
                    setConfirmText('');  // Reset confirm text when closing
                }}
                employee={removeEmployee}  // Pass the employee data
                onConfirm={handleConfirmRemove}
            />
        </div>
    );
};

export default Employees; 