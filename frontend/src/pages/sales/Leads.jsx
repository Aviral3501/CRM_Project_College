import { useState, useEffect, useRef } from 'react';
import Card from '../../components/ui/Card';
import { Plus, Search, Filter, Edit, Trash2, X, Check, ChevronDown, ArrowRight } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';

const CreateLeadModal = ({ isOpen, onClose, onSubmit }) => {
    const initialFormState = {
        name: '',
        email: '',
        phone: '',
        company: '',
        source: '',
        status: 'New',
        priority: 'medium',
        notes: '',
        tags: [],
        budget: '',
        expectedCloseDate: '',
        assignedTo: 'Unassigned',
        assignedToId: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const { userData, BASE_URL } = useUser();
    
    // New state for clients
    const [clients, setClients] = useState([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
            fetchClients();
            setFormData(initialFormState);
            setSelectedClient(null);
        }
    }, [isOpen]);

    // New function to fetch clients
    const fetchClients = async () => {
        try {
            setIsLoadingClients(true);
            const response = await axiosInstance.post(`${BASE_URL}/clients/get-clients`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                setClients(response.data.data);
            } else {
                toast.error("Failed to fetch clients");
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            toast.error("Failed to fetch clients. Please try again.");
        } finally {
            setIsLoadingClients(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            setIsLoadingEmployees(true);
            const response = await axiosInstance.post(`${BASE_URL}/employees/get-employees`, {
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
            toast.error("Failed to fetch employees. Please try again.");
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // New function to handle client selection
    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setFormData(prev => ({
            ...prev,
            company: client.company,
            phone: client.phone,
            notes: client.notes || '',
            tags: client.tags || []
        }));
        setIsClientDropdownOpen(false);
    };

    const handleEmployeeSelect = (employee) => {
        setFormData(prev => ({
            ...prev,
            assignedTo: employee.name,
            assignedToId: employee.user_id
        }));
        setIsDropdownOpen(false);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Create a clean payload
            const payload = {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                source: formData.source,
                status: formData.status,
                priority: formData.priority,
                notes: formData.notes,
                tags: formData.tags,
                budget: formData.budget ? Number(formData.budget) : undefined,
                expectedCloseDate: formData.expectedCloseDate,
            };

            // Only include assignedTo if it's not empty
            if (formData.assignedToId) {
                payload.assignedTo = formData.assignedToId;
            }
            
            // Include client_id if a client is selected
            if (selectedClient) {
                payload.client_id = selectedClient.client_id;
            }

            const response = await axiosInstance.post(`${BASE_URL}/leads/create-lead`, payload);

            if (response.data.success) {
                toast.success('Lead created successfully!');
                onSubmit(response.data.data);
                onClose();
            } else {
                toast.error(response.data.message || 'Failed to create lead');
            }
        } catch (error) {
            console.error('Error creating lead:', error);
            toast.error(error.response?.data?.message || 'Failed to create lead. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all duration-300 ease-in-out">
            <div className="bg-white rounded-xl w-[80%] max-w-5xl shadow-lg transform transition-all duration-300 ease-in-out scale-100 opacity-100">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Lead</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                    placeholder="Enter lead name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Assigned To
                                </label>
                                <div className="relative">
                                    <div 
                                        className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200 flex justify-between items-center cursor-pointer"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        <span className={formData.assignedTo === 'Unassigned' ? 'text-gray-400' : 'text-gray-700'}>
                                            {formData.assignedTo}
                                        </span>
                                        <ChevronDown size={16} className="text-gray-400" />
                                    </div>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            <div 
                                                className="p-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                onClick={() => handleEmployeeSelect({ name: 'Unassigned', user_id: '' })}
                                            >
                                                Unassigned
                                            </div>
                                            {isLoadingEmployees ? (
                                                <div className="p-2 text-center text-gray-500">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
                                                </div>
                                            ) : employees.length > 0 ? (
                                                employees.map(employee => (
                                                    <div 
                                                        key={employee.user_id}
                                                        className="p-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                        onClick={() => handleEmployeeSelect(employee)}
                                                    >
                                                        {employee.name}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-2 text-center text-gray-500">
                                                    No employees found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Company
                                </label>
                                <div className="relative">
                                    <div 
                                        className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200 flex justify-between items-center cursor-pointer"
                                        onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                                    >
                                        <span className={selectedClient ? 'text-gray-700' : 'text-gray-400'}>
                                            {selectedClient ? selectedClient.company : 'Select a client'}
                                        </span>
                                        <ChevronDown size={16} className="text-gray-400" />
                                    </div>
                                    
                                    {isClientDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {isLoadingClients ? (
                                                <div className="p-2 text-center text-gray-500">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
                                                </div>
                                            ) : clients.length > 0 ? (
                                                clients.map(client => (
                                                    <div 
                                                        key={client.client_id}
                                                        className="p-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                        onClick={() => handleClientSelect(client)}
                                                    >
                                                        {client.company}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-2 text-center text-gray-500">
                                                    No clients found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Hidden input to maintain form data */}
                                <input
                                    type="hidden"
                                    name="company"
                                    value={formData.company}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Source
                                </label>
                                <input
                                    type="text"
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                    placeholder="e.g., website, referral, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Lost">Lost</option>
                                </select>
                            </div>

                           
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full h-[120px] p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                    placeholder="Enter any notes about the lead"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2 h-[25px]">
                                    {formData.tags.map((tag, index) => (
                                        <span 
                                            key={index} 
                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                                        >
                                            {tag}
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        className="flex-1 h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                        placeholder="Add a tag and press Enter"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddTag}
                                        className="px-3 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Budget
                                </label>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                    placeholder="Enter budget amount"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Expected Close Date
                                </label>
                                <input
                                    type="date"
                                    name="expectedCloseDate"
                                    value={formData.expectedCloseDate}
                                    onChange={handleChange}
                                    className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            
                        </div>

                      
                    </div>

                    <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-400 text-white rounded-md flex items-center gap-2 hover:bg-blue-500 transition-colors duration-200"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                'Create Lead'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditLeadModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const initialFormState = {
        name: '',
        email: '',
        phone: '',
        company: '',
        source: '',
        status: 'New',
        priority: 'medium',
        notes: '',
        tags: [],
        budget: '',
        expectedCloseDate: '',
        assignedTo: 'Unassigned',
        assignedToId: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const { userData, BASE_URL } = useUser();
    
    // New state for clients
    const [clients, setClients] = useState([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        if (isOpen && initialData) {
            fetchEmployees();
            fetchClients();
            setFormData({
                ...initialFormState,
                ...initialData,
                assignedToId: initialData.assignedToId || ''
            });
            // Set selected client if client data exists in initialData
            if (initialData.client) {
                setSelectedClient({
                    client_id: initialData.client.client_id,
                    company: initialData.client.company,
                    phone: initialData.client.phone,
                    notes: initialData.client.notes,
                    tags: initialData.client.tags
                });
            }
        }
    }, [isOpen, initialData]);

    // New function to fetch clients
    const fetchClients = async () => {
        try {
            setIsLoadingClients(true);
            const response = await axiosInstance.post(`${BASE_URL}/clients/get-clients`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                setClients(response.data.data);
            } else {
                toast.error("Failed to fetch clients");
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            toast.error("Failed to fetch clients. Please try again.");
        } finally {
            setIsLoadingClients(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            setIsLoadingEmployees(true);
            const response = await axiosInstance.post(`${BASE_URL}/employees/get-employees`, {
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
            toast.error("Failed to fetch employees. Please try again.");
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setFormData(prev => ({
            ...prev,
            company: client.company,
            phone: client.phone,
            notes: client.notes || '',
            tags: client.tags || []
        }));
        setIsClientDropdownOpen(false);
    };

    const handleEmployeeSelect = (employee) => {
        setFormData(prev => ({
            ...prev,
            assignedTo: employee.name,
            assignedToId: employee.user_id
        }));
        setIsDropdownOpen(false);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                lead_id: initialData.lead_id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                source: formData.source,
                status: formData.status,
                priority: formData.priority,
                notes: formData.notes,
                tags: formData.tags,
                budget: formData.budget ? Number(formData.budget) : undefined,
                expectedCloseDate: formData.expectedCloseDate,
                client_id: selectedClient?.client_id || null
            };

            // Only include assignedTo if it's not empty
            if (formData.assignedToId) {
                payload.assignedTo = formData.assignedToId;
            }

            const response = await axiosInstance.post(`${BASE_URL}/leads/update-lead`, payload);

            if (response.data.success) {
                toast.success('Lead updated successfully!');
                onSubmit(response.data.data);
                onClose();
            } else {
                toast.error(response.data.message || 'Failed to update lead');
            }
        } catch (error) {
            console.error('Error updating lead:', error);
            toast.error(error.response?.data?.message || 'Failed to update lead. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all duration-300 ease-in-out">
            <div className="bg-white rounded-xl w-[80%] max-w-5xl shadow-lg transform transition-all duration-300 ease-in-out scale-100 opacity-100">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Lead</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                placeholder="Enter lead name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                placeholder="Enter email address"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Company
                            </label>
                            <div className="relative">
                                <div 
                                    className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200 flex justify-between items-center cursor-pointer"
                                    onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                                >
                                    <span className={selectedClient ? 'text-gray-700' : 'text-gray-400'}>
                                        {selectedClient ? selectedClient.company : 'Select a client'}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </div>
                                
                                {isClientDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {isLoadingClients ? (
                                            <div className="p-2 text-center text-gray-500">
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
                                            </div>
                                        ) : clients.length > 0 ? (
                                            clients.map(client => (
                                                <div 
                                                    key={client.client_id}
                                                    className="p-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                    onClick={() => handleClientSelect(client)}
                                                >
                                                    {client.company}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-center text-gray-500">
                                                No clients found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Hidden input to maintain form data */}
                            <input
                                type="hidden"
                                name="company"
                                value={formData.company}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Source
                            </label>
                            <input
                                type="text"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                placeholder="Enter source"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                            >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Lost">Lost</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                placeholder="Enter any notes about the lead"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2 h-[25px]">
                                {formData.tags.map((tag, index) => (
                                    <span 
                                        key={index} 
                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                                    >
                                        {tag}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    className="flex-1 h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                    placeholder="Add a tag and press Enter"
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddTag}
                                    className="px-3 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Budget
                            </label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                                placeholder="Enter budget amount"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Expected Close Date
                            </label>
                            <input
                                type="date"
                                name="expectedCloseDate"
                                value={formData.expectedCloseDate}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Assigned To
                            </label>
                            <div className="relative">
                                <div 
                                    className="w-full h-10 p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200 flex justify-between items-center cursor-pointer"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className={formData.assignedTo === 'Unassigned' ? 'text-gray-400' : 'text-gray-700'}>
                                        {formData.assignedTo}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </div>
                                
                                {isDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        <div 
                                            className="p-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                            onClick={() => handleEmployeeSelect({ name: 'Unassigned', user_id: '' })}
                                        >
                                            Unassigned
                                        </div>
                                        {isLoadingEmployees ? (
                                            <div className="p-2 text-center text-gray-500">
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
                                            </div>
                                        ) : employees.length > 0 ? (
                                            employees.map(employee => (
                                                <div 
                                                    key={employee.user_id}
                                                    className="p-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                    onClick={() => handleEmployeeSelect(employee)}
                                                >
                                                    {employee.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-center text-gray-500">
                                                No employees found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-400 text-white rounded-md flex items-center gap-2 hover:bg-blue-500 transition-colors duration-200"
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

const FILTER_FIELDS = [
    { label: 'Company', value: 'company', type: 'string' },
    { label: 'Budget', value: 'budget', type: 'number' },
    { label: 'Priority', value: 'priority', type: 'enum', options: ['low', 'medium', 'high'] },
    { label: 'Status', value: 'status', type: 'enum', options: ['New', 'Contacted', 'Qualified', 'Lost'] },
    { label: 'Expected Close', value: 'expectedCloseDate', type: 'date' },
    { label: 'Created Date', value: 'createdAt', type: 'date' },
    { label: 'Assigned To', value: 'assignedTo', type: 'string' },
];

const STRING_OPERATORS = [
    { label: 'Contains', value: 'contains' },
    { label: 'Equals', value: 'eq' },
    { label: 'Not Equals', value: 'neq' },
    { label: 'Starts With', value: 'starts' },
    { label: 'Ends With', value: 'ends' },
];
const NUMBER_OPERATORS = [
    { label: '=', value: 'eq' },
    { label: '\u2260', value: 'neq' },
    { label: '>', value: 'gt' },
    { label: '<', value: 'lt' },
    { label: '\u2265', value: 'gte' },
    { label: '\u2264', value: 'lte' },
    { label: 'Between', value: 'between' },
];
const DATE_OPERATORS = [
    { label: '=', value: 'eq' },
    { label: '\u2260', value: 'neq' },
    { label: 'Before', value: 'before' },
    { label: 'After', value: 'after' },
    { label: 'Between', value: 'between' },
];
const ENUM_OPERATORS = [
    { label: 'Is', value: 'eq' },
    { label: 'Is Not', value: 'neq' },
    { label: 'In', value: 'in' },
    { label: 'Not In', value: 'notin' },
];

function getOperatorsForType(type) {
    if (type === 'string') return STRING_OPERATORS;
    if (type === 'number') return NUMBER_OPERATORS;
    if (type === 'date') return DATE_OPERATORS;
    if (type === 'enum') return ENUM_OPERATORS;
    return [];
}

const FilterModal = ({ isOpen, onClose, onApply, filters, setFilters }) => {
    const { userData, BASE_URL } = useUser();
    const [employees, setEmployees] = useState([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const fetchedEmployeesRef = useRef(false);

    useEffect(() => {
        // Reset employees when modal closes
        if (!isOpen) {
            setEmployees([]);
            fetchedEmployeesRef.current = false;
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        if (fetchedEmployeesRef.current) return;
        try {
            setIsLoadingEmployees(true);
            const response = await axiosInstance.post(`${BASE_URL}/employees/get-employees`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });
            if (response.data.success) {
                setEmployees(response.data.data);
                fetchedEmployeesRef.current = true;
            }
        } catch (error) {
            setEmployees([]);
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    const addFilter = () => {
        setFilters(prev => ([...prev, { field: '', operator: '', value: '', value2: '' }]));
    };
    const removeFilter = (idx) => {
        setFilters(prev => prev.filter((_, i) => i !== idx));
    };
    const updateFilter = (idx, key, val) => {
        setFilters(prev => prev.map((f, i) => i === idx ? { ...f, [key]: val, ...(key === 'field' ? { operator: '', value: '', value2: '' } : {}) } : f));
    };
    const resetFilters = () => setFilters([]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Filter Leads</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {filters.map((filter, idx) => {
                        const fieldMeta = FILTER_FIELDS.find(f => f.value === filter.field);
                        const operators = fieldMeta ? getOperatorsForType(fieldMeta.type) : [];
                        // Assigned To special dropdown
                        if (filter.field === 'assignedTo') {
                            if (!employees.length && !isLoadingEmployees) fetchEmployees();
                        }
                        return (
                            <div key={idx} className="flex gap-2 items-center">
                                <select className="border rounded-md h-10 px-2" value={filter.field} onChange={e => updateFilter(idx, 'field', e.target.value)}>
                                    <option value="">Select Field</option>
                                    {FILTER_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                                <select className="border rounded-md h-10 px-2" value={filter.operator} onChange={e => updateFilter(idx, 'operator', e.target.value)} disabled={!filter.field}>
                                    <option value="">Operator</option>
                                    {operators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                                </select>
                                {/* Value input(s) */}
                                {filter.field === 'assignedTo' ? (
                                    isLoadingEmployees ? (
                                        <div className="h-10 flex items-center px-2 text-gray-400">Loading...</div>
                                    ) : (
                                        <select
                                            className="border rounded-md h-10 px-2"
                                            value={filter.value?.user_id || ''}
                                            onChange={e => {
                                                const emp = employees.find(emp => emp.user_id === e.target.value);
                                                if (emp) {
                                                    updateFilter(idx, 'value', emp);
                                                    console.log('Selected employee:', emp);
                                                }
                                            }}
                                        >
                                            <option value="">Select Employee</option>
                                            {employees.map(emp => (
                                                <option key={emp.user_id} value={emp.user_id}>{emp.name}</option>
                                            ))}
                                        </select>
                                    )
                                ) : fieldMeta && fieldMeta.type === 'enum' ? (
                                    (filter.operator === 'in' || filter.operator === 'notin') ? (
                                        <select multiple className="border rounded-md h-10 px-2" value={filter.value || []} onChange={e => updateFilter(idx, 'value', Array.from(e.target.selectedOptions, o => o.value))}>
                                            {fieldMeta.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <select className="border rounded-md h-10 px-2" value={filter.value} onChange={e => updateFilter(idx, 'value', e.target.value)}>
                                            <option value="">Select</option>
                                            {fieldMeta.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    )
                                ) : fieldMeta && fieldMeta.type === 'date' && filter.operator === 'between' ? (
                                    <>
                                        <input type="date" className="border rounded-md h-10 px-2" value={filter.value} onChange={e => updateFilter(idx, 'value', e.target.value)} />
                                        <span className="mx-1">to</span>
                                        <input type="date" className="border rounded-md h-10 px-2" value={filter.value2} onChange={e => updateFilter(idx, 'value2', e.target.value)} />
                                    </>
                                ) : fieldMeta && fieldMeta.type === 'number' && filter.operator === 'between' ? (
                                    <>
                                        <input type="number" className="border rounded-md h-10 px-2" value={filter.value} onChange={e => updateFilter(idx, 'value', e.target.value)} placeholder="Min" />
                                        <span className="mx-1">to</span>
                                        <input type="number" className="border rounded-md h-10 px-2" value={filter.value2} onChange={e => updateFilter(idx, 'value2', e.target.value)} placeholder="Max" />
                                    </>
                                ) : fieldMeta && fieldMeta.type === 'date' ? (
                                    <input type="date" className="border rounded-md h-10 px-2" value={filter.value} onChange={e => updateFilter(idx, 'value', e.target.value)} />
                                ) : fieldMeta && fieldMeta.type === 'number' ? (
                                    <input type="number" className="border rounded-md h-10 px-2" value={filter.value} onChange={e => updateFilter(idx, 'value', e.target.value)} />
                                ) : (
                                    <input type="text" className="border rounded-md h-10 px-2" value={filter.value} onChange={e => updateFilter(idx, 'value', e.target.value)} />
                                )}
                                <button onClick={() => removeFilter(idx)} className="text-red-400 hover:text-red-600 ml-2"><X size={18} /></button>
                            </div>
                        );
                    })}
                    <button onClick={addFilter} className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Add Filter</button>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={resetFilters} className="px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50">Reset</button>
                    <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={onApply} className="px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500">Apply</button>
                </div>
            </div>
        </div>
    );
};

// Helper to highlight filter matches
function highlightMatch(text, filter, fieldType) {
    if (!filter || !filter.value) return text;
    if (typeof text !== 'string') text = String(text ?? '');
    if (fieldType === 'string' || fieldType === 'enum' || filter.field === 'assignedTo') {
        let search = '';
        if (filter.field === 'assignedTo' && filter.value && filter.value.name) {
            search = filter.value.name;
        } else {
            search = filter.value;
        }
        if (!search) return text;
        const regex = new RegExp(`(${search})`, 'gi');
        return text.split(regex).map((part, i) =>
            regex.test(part) ? <span key={i} className="bg-yellow-100 rounded">{part}</span> : part
        );
    }
    // For number/date, highlight whole cell if matches
    return <span className="bg-yellow-100 rounded px-1">{text}</span>;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-all duration-300 ease-in-out">
            <div className="bg-white rounded-xl w-[400px] shadow-lg transform transition-all duration-300 ease-in-out scale-100 opacity-100">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
                    <p className="text-gray-600">{message}</p>
                </div>
                <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [filters, setFilters] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { userData, BASE_URL } = useUser();
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        setFilteredLeads(leads);
    }, [leads]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredLeads(leads);
            return;
        }

        const searchTerm = searchQuery.toLowerCase();
        const filtered = leads.filter(lead => {
            return (
                (lead.name?.toLowerCase().includes(searchTerm)) ||
                (lead.email?.toLowerCase().includes(searchTerm)) ||
                (lead.phone?.toLowerCase().includes(searchTerm)) ||
                (lead.company?.toLowerCase().includes(searchTerm)) ||
                (lead.source?.toLowerCase().includes(searchTerm)) ||
                (lead.budget?.toString().includes(searchTerm)) ||
                (lead.priority?.toLowerCase().includes(searchTerm)) ||
                (lead.status?.toLowerCase().includes(searchTerm)) ||
                (lead.assignedTo?.toLowerCase().includes(searchTerm))
            );
        });
        setFilteredLeads(filtered);
    }, [searchQuery, leads]);

    const highlightSearchMatch = (text, searchTerm) => {
        if (!searchTerm || !text) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.toString().split(regex).map((part, i) =>
            regex.test(part) ? <span key={i} className="bg-yellow-200 rounded px-1">{part}</span> : part
        );
    };

    const fetchLeads = async () => {
        try {
            setIsLoading(true);
            console.log('Fetching leads from:', `${BASE_URL}/leads/get-leads`);
            console.log('Request payload:', {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            const response = await axiosInstance.post(`${BASE_URL}/leads/get-leads`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });
            
            console.log('Leads API Response:', response.data);
            
            if (response.data.success) {
                const leadsData = response.data.data || [];
                setLeads(leadsData);
                console.log('Leads fetched successfully:', leadsData.length, 'leads');
            } else {
                console.error('API Error:', response.data.message);
                toast.error(response.data.message || "Failed to fetch leads");
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error("Failed to fetch leads. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectLead = (leadId) => {
        setSelectedLeads(prev => {
            if (prev.includes(leadId)) {
                return prev.filter(id => id !== leadId);
            } else {
                return [...prev, leadId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedLeads.length === leads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(leads.map(lead => lead.lead_id));
        }
    };

    const handleEditLead = (lead) => {
        setSelectedLead(lead);
        setIsEditModalOpen(true);
    };

    const handleDeleteLeads = async () => {
        if (selectedLeads.length === 0) return;
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/leads/delete-lead`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                lead_ids: selectedLeads
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setSelectedLeads([]);
                fetchLeads();
            } else {
                toast.error(response.data.message || "Failed to delete leads");
            }
        } catch (error) {
            console.error("Error deleting leads:", error);
            toast.error(error.response?.data?.message || "Failed to delete leads. Please try again.");
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setSelectedLeads([]);
    };

    const handleAddLead = (newLead) => {
        setLeads(prev => [...prev, newLead]);
    };

    const handleUpdateLead = async (updatedLead) => {
        try {
            // Fetch all leads to get the fresh data
            const response = await axiosInstance.post(`${BASE_URL}/leads/get-leads`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                // Update the leads list with all the fresh data
                setLeads(response.data.data || []);
                // Unselect the lead after successful update
                setSelectedLeads([]);
                setSelectedLead(null);
                setIsEditModalOpen(false);
            } else {
                toast.error("Failed to fetch updated leads data");
            }
        } catch (error) {
            console.error("Error fetching updated leads:", error);
            toast.error("Failed to fetch updated leads data. Please refresh the page.");
        }
    };

    const handleConvertToPipeline = async () => {
        if (selectedLeads.length === 0) {
            toast.error("Please select at least one lead to convert");
            return;
        }

        try {
            setIsConverting(true);
            // Get the selected lead to access its client_id
            const selectedLead = filteredLeads.find(lead => lead.lead_id === selectedLeads[0]);
            
            const response = await axiosInstance.post(`${BASE_URL}/pipeline/generate-pipeline-from-leads`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                lead_ids: selectedLeads,
                stage: 'Qualified', // Force default stage to Qualified
                client_id: selectedLead?.client?.client_id || null // Include client_id from the lead
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setSelectedLeads([]);
                // Remove converted leads from the table
                setLeads(prev => prev.filter(lead => !selectedLeads.includes(lead.lead_id)));
            } else {
                toast.error(response.data.message || "Failed to convert leads to pipeline");
            }
        } catch (error) {
            console.error("Error converting leads to pipeline:", error);
            toast.error(error.response?.data?.message || "Failed to convert leads to pipeline. Please try again.");
        } finally {
            setIsConverting(false);
        }
    };

    const applyFilters = () => {
        if (filters.length === 0) {
            setFilteredLeads(leads);
            setIsFilterModalOpen(false);
            return;
        }
        let result = [...leads];
        filters.forEach(f => {
            if (!f.field || !f.operator) return;
            const fieldMeta = FILTER_FIELDS.find(meta => meta.value === f.field);
            if (!fieldMeta) return;
            result = result.filter(lead => {
                const val = f.field === 'assignedTo' && f.value && f.value.name ? lead[f.field] : lead[f.field];
                if (f.field === 'assignedTo' && f.value && f.value.name) {
                    // Use employee name for filtering
                    if (f.operator === 'eq') return val === f.value.name;
                    if (f.operator === 'neq') return val !== f.value.name;
                    if (f.operator === 'contains') return val?.toLowerCase().includes(f.value.name.toLowerCase());
                    if (f.operator === 'starts') return val?.toLowerCase().startsWith(f.value.name.toLowerCase());
                    if (f.operator === 'ends') return val?.toLowerCase().endsWith(f.value.name.toLowerCase());
                } else if (fieldMeta.type === 'string') {
                    if (f.operator === 'contains') return val?.toLowerCase().includes(f.value.toLowerCase());
                    if (f.operator === 'eq') return val?.toLowerCase() === f.value.toLowerCase();
                    if (f.operator === 'neq') return val?.toLowerCase() !== f.value.toLowerCase();
                    if (f.operator === 'starts') return val?.toLowerCase().startsWith(f.value.toLowerCase());
                    if (f.operator === 'ends') return val?.toLowerCase().endsWith(f.value.toLowerCase());
                } else if (fieldMeta.type === 'number') {
                    const num = Number(val);
                    const fval = Number(f.value);
                    const fval2 = Number(f.value2);
                    if (f.operator === 'eq') return num === fval;
                    if (f.operator === 'neq') return num !== fval;
                    if (f.operator === 'gt') return num > fval;
                    if (f.operator === 'lt') return num < fval;
                    if (f.operator === 'gte') return num >= fval;
                    if (f.operator === 'lte') return num <= fval;
                    if (f.operator === 'between') return num >= fval && num <= fval2;
                } else if (fieldMeta.type === 'date') {
                    const date = val ? new Date(val) : null;
                    const fdate = f.value ? new Date(f.value) : null;
                    const fdate2 = f.value2 ? new Date(f.value2) : null;
                    if (!date) return false;
                    if (f.operator === 'eq') return date.toDateString() === fdate?.toDateString();
                    if (f.operator === 'neq') return date.toDateString() !== fdate?.toDateString();
                    if (f.operator === 'before') return date < fdate;
                    if (f.operator === 'after') return date > fdate;
                    if (f.operator === 'between') return date >= fdate && date <= fdate2;
                } else if (fieldMeta.type === 'enum') {
                    if (f.operator === 'eq') return val === f.value;
                    if (f.operator === 'neq') return val !== f.value;
                    if (f.operator === 'in') return Array.isArray(f.value) ? f.value.includes(val) : false;
                    if (f.operator === 'notin') return Array.isArray(f.value) ? !f.value.includes(val) : true;
                }
                return true;
            });
        });
        setFilteredLeads(result);
        setIsFilterModalOpen(false);
    };

    const resetFilters = () => {
        setFilters([]);
        setFilteredLeads(leads);
    };

    return (
        <div className='w-full h-screen max-w-[1600px] mx-auto px-4'>
              <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-500 transition-colors duration-200 shadow-sm"
                >
                    <Plus size={20} />
                    Add Lead
                </button>
            </div>

            <Card className="mb-6 shadow-sm border border-gray-100">
                <div className="p-4 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border z-0 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                        />
                    </div>
                    <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200">
                        <Filter size={20} />
                        Filter
                    </button>
                </div>
            </Card>

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={applyFilters}
                filters={filters}
                setFilters={setFilters}
            />

            <Card className="shadow-sm border border-gray-100">
                <div className="w-full">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
                        </div>
                    ) : filteredLeads.length > 0 ? (
                        <div>
                            <div className={`transition-all duration-300 ease-in-out`}>
                                <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-start items-center">
                                    <div className="flex gap-3 h-[40px]">
                                        {selectedLeads.length === 1 && (
                                            <button 
                                                onClick={() => handleEditLead(filteredLeads.find(lead => lead.lead_id === selectedLeads[0]))}
                                                className="w-[100px] h-10 bg-blue-400 text-white rounded-md flex items-center justify-center hover:bg-blue-500 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                                            >
                                               <div className="flex items-center gap-2">
                                               <Edit size={18} />
                                               <span className="text-sm">Edit</span>
                                               </div>
                                            </button>
                                        )}
                                        {selectedLeads.length >= 1 && (
                                            <button 
                                                onClick={handleDeleteLeads}
                                                className="w-[100px] h-10 bg-red-400 text-white rounded-md flex items-center justify-center hover:bg-red-500 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-2">
                                                <Trash2 size={18} />
                                                <span className="text-sm">Delete</span>
                                                </div>
                                            </button>
                                        )}
                                        {selectedLeads.length == 1 && (
                                            <button 
                                                onClick={handleConvertToPipeline}
                                                disabled={isConverting}
                                                className="w-[160px] h-10 bg-green-500 text-white rounded-md flex items-center justify-center hover:bg-green-600 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-2">
                                                {isConverting ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                ) : (
                                                    <ArrowRight size={18} />
                                                )}
                                                <span className="text-sm">
                                                    {isConverting ? "Converting..." : "Convert to Pipeline"}
                                                </span>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="h-[calc(100vh-300px)] overflow-y-auto overflow-x-auto w-full">
                                <div className="w-full">
                                    <table className="w-full table-fixed divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="w-[150px]  px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedLeads.length === filteredLeads.length}
                                                            onChange={handleSelectAll}
                                                            className="h-4 w-4 text-blue-400 rounded border-gray-300 focus:ring-blue-200"
                                                        />
                                                    </div>
                                                </th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Close</th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                                                <th className="w-[150px] xl:w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100 ">
                                            {filteredLeads.map((lead) => (
                                                <tr key={lead.lead_id} className="hover:bg-gray-50 transition-colors duration-150">
                                                    <td className="w-[50px]   px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedLeads.includes(lead.lead_id)}
                                                            onChange={() => handleSelectLead(lead.lead_id)}
                                                            className="h-4 w-4 text-blue-400 rounded border-gray-300 focus:ring-blue-200"
                                                        />
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap text-gray-700 truncate" title={lead.name}>
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'name');
                                                            if (filter) return highlightMatch(lead.name, filter, 'string');
                                                            return searchQuery ? highlightSearchMatch(lead.name, searchQuery) : lead.name;
                                                        })()}
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap text-gray-700 truncate" title={lead.email}>
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'email');
                                                            if (filter) return highlightMatch(lead.email, filter, 'string');
                                                            return searchQuery ? highlightSearchMatch(lead.email, searchQuery) : lead.email;
                                                        })()}
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap text-gray-700 truncate" title={lead.phone}>
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'phone');
                                                            if (filter) return highlightMatch(lead.phone, filter, 'string');
                                                            return searchQuery ? highlightSearchMatch(lead.phone, searchQuery) : lead.phone;
                                                        })()}
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap text-gray-700 truncate" title={lead.company || '-'}>
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'company');
                                                            if (filter) return highlightMatch(lead.company, filter, 'string');
                                                            return searchQuery ? highlightSearchMatch(lead.company || '-', searchQuery) : (lead.company || '-');
                                                        })()}
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap text-gray-700 truncate" title={lead.source || '-'}>
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'source');
                                                            if (filter) return highlightMatch(lead.source, filter, 'string');
                                                            return searchQuery ? highlightSearchMatch(lead.source || '-', searchQuery) : (lead.source || '-');
                                                        })()}
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap text-gray-700 truncate" title={lead.budget ? `$${lead.budget.toLocaleString()}` : '-'}>
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'budget');
                                                            const budgetText = lead.budget ? `$${lead.budget.toLocaleString()}` : '-';
                                                            if (filter) return highlightMatch(budgetText, filter, 'number');
                                                            return searchQuery ? highlightSearchMatch(budgetText, searchQuery) : budgetText;
                                                        })()}
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap">
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'priority');
                                                            const val = lead.priority ? lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1) : '-';
                                                            return filter ? (
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    lead.priority === 'high' ? 'bg-red-50 text-red-600' :
                                                                    lead.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                                                                    'bg-green-50 text-green-600'
                                                                }`}>
                                                                    {highlightMatch(val, filter, 'enum')}
                                                                </span>
                                                            ) : (
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    lead.priority === 'high' ? 'bg-red-50 text-red-600' :
                                                                    lead.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                                                                    'bg-green-50 text-green-600'
                                                                }`}>
                                                                    {val}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap text-gray-700 truncate" title={lead.expectedCloseDate ? new Date(lead.expectedCloseDate).toLocaleDateString() : '-'}>
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'expectedCloseDate');
                                                            const val = lead.expectedCloseDate ? new Date(lead.expectedCloseDate).toLocaleDateString() : '-';
                                                            if (filter) return highlightMatch(val, filter, 'date');
                                                            return val;
                                                        })()}
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap">
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'status');
                                                            return filter ? (
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    lead.status === 'New' ? 'bg-green-50 text-green-600' :
                                                                    lead.status === 'Contacted' ? 'bg-blue-50 text-blue-600' :
                                                                    lead.status === 'Qualified' ? 'bg-purple-50 text-purple-600' :
                                                                    'bg-gray-50 text-gray-600'
                                                                }`}>
                                                                    {highlightMatch(lead.status, filter, 'enum')}
                                                                </span>
                                                            ) : (
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    lead.status === 'New' ? 'bg-green-50 text-green-600' :
                                                                    lead.status === 'Contacted' ? 'bg-blue-50 text-blue-600' :
                                                                    lead.status === 'Qualified' ? 'bg-purple-50 text-purple-600' :
                                                                    'bg-gray-50 text-gray-600'
                                                                }`}>
                                                                    {lead.status}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap text-gray-700 truncate" title={lead.assignedTo}>
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'assignedTo');
                                                            return filter ? highlightMatch(lead.assignedTo, filter, 'string') : lead.assignedTo;
                                                        })()}
                                                    </td>
                                                    <td className="w-[150px] xl:w-[250px] px-6 py-4 whitespace-nowrap text-gray-700 truncate" title={new Date(lead.createdAt).toLocaleDateString()}>
                                                        {(() => {
                                                            const filter = filters.find(f => f.field === 'createdAt');
                                                            const val = new Date(lead.createdAt).toLocaleDateString();
                                                            if (filter) return highlightMatch(val, filter, 'date');
                                                            return val;
                                                        })()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <div className="mb-4">
                                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium">No leads found</p>
                            <p className="text-sm text-gray-400 mt-1">Get started by adding your first lead</p>
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="mt-4 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
                            >
                                Add Lead
                            </button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Add Lead Modal */}
            <CreateLeadModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddLead}
            />

            {/* Edit Lead Modal */}
            <EditLeadModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedLead(null);
                }}
                onSubmit={handleUpdateLead}
                initialData={selectedLead}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Leads"
                message={`Are you sure you want to delete ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''}? This action cannot be undone.`}
            />
        </div>
        </div>
      
    );
};

export default Leads; 