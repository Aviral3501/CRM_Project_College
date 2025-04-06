import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Plus, Search, Filter, Mail, Phone, Building, MapPin, MoreVertical, X, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Customer Form Modal (used for both Add and Edit)
const CustomerFormModal = ({ isOpen, onClose, onSubmit, customer = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active',
        totalValue: 0,
        lastPurchase: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (customer) {
            setFormData(customer);
        }
    }, [customer]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            id: customer?.id || Date.now()
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
                            <h2 className="text-xl font-bold">
                                {customer ? 'Edit Customer' : 'Add New Customer'}
                            </h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.contact}
                                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Value</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.totalValue}
                                    onChange={(e) => setFormData({...formData, totalValue: Number(e.target.value)})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
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
                                    {customer ? 'Save Changes' : 'Add Customer'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Delete Customer Modal (First Step)
const DeleteCustomerModal = ({ isOpen, onClose, customer, onProceed }) => {
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
                            <h2 className="text-xl font-bold text-red-600">Delete Customer</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg">{customer?.name}</h3>
                                <p className="text-gray-600">{customer?.contact}</p>
                                <div className="mt-2 space-y-2">
                                    <p className="text-sm text-gray-600">Email: {customer?.email}</p>
                                    <p className="text-sm text-gray-600">Phone: {customer?.phone}</p>
                                    <p className="text-sm text-gray-600">Address: {customer?.address}</p>
                                    <p className="text-sm text-gray-600">Total Value: ${customer?.totalValue.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">Last Purchase: {new Date(customer?.lastPurchase).toLocaleDateString()}</p>
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
            )}
        </AnimatePresence>
    );
};

// Delete Confirmation Dialog (Second Step)
const DeleteConfirmationDialog = ({ isOpen, onClose, customer, onConfirm }) => {
    const [confirmText, setConfirmText] = useState('');
    
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
                        <div className="flex justify-center text-red-500 mb-4">
                            <AlertTriangle size={48} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-center mb-2">Confirm Customer Deletion</h3>
                        <p className="text-gray-600 text-center mb-6">
                            This action cannot be undone. Please type <span className="font-semibold text-red-600">{customer?.name}</span> to confirm deletion.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type customer name to confirm"
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
                                    disabled={confirmText !== customer?.name}
                                    className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 
                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Delete Customer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const Customers = () => {
    const [customers, setCustomers] = useState([
        {
            id: 1,
            name: 'Tech Corp',
            contact: 'John Doe',
            email: 'john@techcorp.com',
            phone: '+1 234-567-8900',
            address: '123 Tech Street, San Francisco, CA',
            status: 'Active',
            totalValue: 150000,
            lastPurchase: '2024-03-15'
        },
        {
            id: 2,
            name: 'Design Co',
            contact: 'Jane Smith',
            email: 'jane@designco.com',
            phone: '+1 234-567-8901',
            address: '456 Design Ave, New York, NY',
            status: 'Active',
            totalValue: 75000,
            lastPurchase: '2024-03-10'
        },
        {
            id: 3,
            name: 'Software Inc',
            contact: 'Mike Johnson',
            email: 'mike@softwareinc.com',
            phone: '+1 234-567-8902',
            address: '789 Software Blvd, Seattle, WA',
            status: 'Inactive',
            totalValue: 200000,
            lastPurchase: '2024-02-28'
        }
    ]);
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [deleteCustomer, setDeleteCustomer] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.customer-menu')) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddCustomer = (newCustomer) => {
        setCustomers(prev => [...prev, newCustomer]);
    };

    const handleUpdateCustomer = (updatedCustomer) => {
        setCustomers(prev => prev.map(c => 
            c.id === updatedCustomer.id ? updatedCustomer : c
        ));
    };

    const handleDeleteCustomer = (customerId) => {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Customers</h1>
                <button 
                    onClick={() => {
                        setSelectedCustomer(null);
                        setIsFormModalOpen(true);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
                >
                    <Plus size={20} />
                    Add Customer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer) => (
                    <Card key={customer.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{customer.name}</h3>
                                <p className="text-sm text-gray-500">{customer.contact}</p>
                            </div>
                            <div className="relative customer-menu">
                                <button 
                                    onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                >
                                    <MoreVertical size={20} />
                                </button>
                                {openMenuId === customer.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                                    >
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setIsFormModalOpen(true);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <Edit2 size={16} />
                                                Edit Customer
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeleteCustomer(customer);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                Delete Customer
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail size={16} className="mr-2" />
                                {customer.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone size={16} className="mr-2" />
                                {customer.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin size={16} className="mr-2" />
                                {customer.address}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Building size={16} className="mr-2" />
                                Total Value: ${customer.totalValue.toLocaleString()}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    customer.status === 'Active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {customer.status}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Last Purchase: {new Date(customer.lastPurchase).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <CustomerFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedCustomer(null);
                }}
                onSubmit={(customer) => {
                    if (selectedCustomer) {
                        handleUpdateCustomer(customer);
                    } else {
                        handleAddCustomer(customer);
                    }
                }}
                customer={selectedCustomer}
            />

            <DeleteCustomerModal
                isOpen={!!deleteCustomer && !showDeleteConfirm}
                onClose={() => setDeleteCustomer(null)}
                customer={deleteCustomer}
                onProceed={() => setShowDeleteConfirm(true)}
            />

            <DeleteConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteCustomer(null);
                }}
                customer={deleteCustomer}
                onConfirm={() => {
                    handleDeleteCustomer(deleteCustomer.id);
                    setShowDeleteConfirm(false);
                    setDeleteCustomer(null);
                }}
            />
        </div>
    );
};

export default Customers; 