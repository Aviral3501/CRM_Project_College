import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Plus, Search, Filter, Download, Eye, DollarSign, Calendar, User, X, AlertTriangle, MoreVertical, Trash2, Edit2, XCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "../../context/UserContext";
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create/Edit Quote Modal
const QuoteFormModal = ({ isOpen, onClose, onSubmit, quote = null, clients = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        client_id: '',
        validUntil: '',
        status: 'Draft',
        items: [],
        notes: '',
        terms: '',
        discount: 0,
        tax: 0,
        total: 0,
        amount: 0,
        clientInfo: {
            name: '',
            company: '',
            email: '',
            phone: '',
            address: {
                street: '',
                city: '',
                state: '',
                country: '',
                zipCode: ''
            },
            industry: '',
            website: '',
            taxId: '',
            registrationNumber: ''
        },
        billingInfo: {
            name: '',
            company: '',
            address: {
                street: '',
                city: '',
                state: '',
                country: '',
                zipCode: ''
            },
            email: '',
            phone: '',
            taxExempt: false,
            paymentTerms: '',
            preferredPaymentMethod: ''
        },
        currency: 'USD',
        paymentDueDate: '',
        shippingAddress: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
        },
        shippingMethod: '',
        shippingCost: 0,
        shippingNotes: ''
    });
    const [newItem, setNewItem] = useState({ name: '', description: '', quantity: 1, price: 0 });
    const [sameAsBilling, setSameAsBilling] = useState(false);

    useEffect(() => {
        if (quote) {
            setFormData({
                ...quote,
                client_id: quote.client?.client_id || '',
                title: quote.title || '',
                notes: quote.notes || '',
                terms: quote.terms || '',
                discount: quote.discount || 0,
                tax: quote.tax || 0,
                total: quote.total || 0,
                amount: quote.amount || 0,
                clientInfo: quote.clientInfo || {
                    name: '',
                    company: '',
                    email: '',
                    phone: '',
                    address: {
                        street: '',
                        city: '',
                        state: '',
                        country: '',
                        zipCode: ''
                    },
                    industry: '',
                    website: '',
                    taxId: '',
                    registrationNumber: ''
                },
                billingInfo: quote.billingInfo || {
                    name: '',
                    company: '',
                    address: {
                        street: '',
                        city: '',
                        state: '',
                        country: '',
                        zipCode: ''
                    },
                    email: '',
                    phone: '',
                    taxExempt: false,
                    paymentTerms: '',
                    preferredPaymentMethod: ''
                },
                currency: quote.currency || 'USD',
                paymentDueDate: quote.paymentDueDate || '',
                shippingAddress: quote.shippingAddress || {
                    street: '',
                    city: '',
                    state: '',
                    country: '',
                    zipCode: ''
                },
                shippingMethod: quote.shippingMethod || '',
                shippingCost: quote.shippingCost || 0,
                shippingNotes: quote.shippingNotes || ''
            });
        }
    }, [quote]);

    // Function to handle client selection and prefill data
    const handleClientChange = (e) => {
        const selectedClientId = e.target.value;
        setFormData(prev => ({ ...prev, client_id: selectedClientId }));
        
        if (selectedClientId) {
            const selectedClient = clients.find(client => client.client_id === selectedClientId);
            if (selectedClient) {
                // Prefill client information
                setFormData(prev => ({
                    ...prev,
                    clientInfo: {
                        name: selectedClient.name || '',
                        company: selectedClient.company || '',
                        email: selectedClient.email || '',
                        phone: selectedClient.phone || '',
                        address: selectedClient.address || {
                            street: '',
                            city: '',
                            state: '',
                            country: '',
                            zipCode: ''
                        },
                        industry: selectedClient.industry || '',
                        website: selectedClient.website || '',
                        taxId: selectedClient.businessDetails?.taxId || '',
                        registrationNumber: selectedClient.businessDetails?.registrationNumber || ''
                    },
                    billingInfo: {
                        name: selectedClient.name || '',
                        company: selectedClient.company || '',
                        address: selectedClient.financialInfo?.billingAddress || selectedClient.address || {
                            street: '',
                            city: '',
                            state: '',
                            country: '',
                            zipCode: ''
                        },
                        email: selectedClient.email || '',
                        phone: selectedClient.phone || '',
                        taxExempt: selectedClient.financialInfo?.taxExempt || false,
                        paymentTerms: selectedClient.financialInfo?.paymentTerms || '',
                        preferredPaymentMethod: selectedClient.financialInfo?.preferredPaymentMethod || ''
                    }
                }));
            }
        }
    };

    // Function to handle same as billing address checkbox
    const handleSameAsBillingChange = (e) => {
        setSameAsBilling(e.target.checked);
        if (e.target.checked) {
            setFormData(prev => ({
                ...prev,
                shippingAddress: { ...prev.billingInfo.address }
            }));
        }
    };

    const addItem = () => {
        if (newItem.name && newItem.price > 0) {
            const itemTotal = newItem.quantity * newItem.price;
            setFormData(prev => ({
                ...prev,
                items: [...prev.items, { 
                    ...newItem, 
                    total: itemTotal 
                }]
            }));
            setNewItem({ name: '', description: '', quantity: 1, price: 0 });
        }
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discountAmount = (subtotal * formData.discount) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * formData.tax) / 100;
        const shippingCost = formData.shippingCost || 0;
        return afterDiscount + taxAmount + shippingCost;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const subtotal = calculateSubtotal();
        const discountAmount = (subtotal * formData.discount) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * formData.tax) / 100;
        const shippingCost = formData.shippingCost || 0;
        const total = afterDiscount + taxAmount + shippingCost;
        
        const selectedClient = clients.find(client => client.client_id === formData.client_id);
        onSubmit({
            ...formData,
            id: quote?.id || `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            amount: subtotal,
            total: total,
            client: selectedClient,
            createdAt: quote?.createdAt || new Date().toISOString().split('T')[0]
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{quote ? 'Edit Quote' : 'Create New Quote'}</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Quote Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="Enter quote title"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Client</label>
                                    <select
                                        required
                                        value={formData.client_id}
                                        onChange={handleClientChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    >
                                        <option value="">Select a client</option>
                                        {clients.map(client => (
                                            <option key={client.client_id} value={client.client_id}>
                                                {client.company || client.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
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
                                        <option value="Pending">Pending</option>
                                        <option value="Accepted">Accepted</option>
                                        <option value="Declined">Declined</option>
                                        <option value="Expired">Expired</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        placeholder="Enter any additional notes"
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
                                    <textarea
                                        value={formData.terms}
                                        onChange={(e) => setFormData({...formData, terms: e.target.value})}
                                        placeholder="Enter terms and conditions"
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>

                            {/* Client Information Section */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium mb-4">Client Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Client Name</label>
                                        <input
                                            type="text"
                                            value={formData.clientInfo.name}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                clientInfo: {...formData.clientInfo, name: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company</label>
                                        <input
                                            type="text"
                                            value={formData.clientInfo.company}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                clientInfo: {...formData.clientInfo, company: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            value={formData.clientInfo.email}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                
                                                clientInfo: {...formData.clientInfo, email: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            value={formData.clientInfo.phone}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                clientInfo: {...formData.clientInfo, phone: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Industry</label>
                                        <input
                                            type="text"
                                            value={formData.clientInfo.industry}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                clientInfo: {...formData.clientInfo, industry: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Website</label>
                                        <input
                                            type="text"
                                            value={formData.clientInfo.website}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                clientInfo: {...formData.clientInfo, website: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <h4 className="text-md font-medium mb-2">Address</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Street</label>
                                            <input
                                                type="text"
                                                value={formData.clientInfo.address.street}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    clientInfo: {
                                                        ...formData.clientInfo, 
                                                        address: {...formData.clientInfo.address, street: e.target.value}
                                                    }
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City</label>
                                            <input
                                                type="text"
                                                value={formData.clientInfo.address.city}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    clientInfo: {
                                                        ...formData.clientInfo, 
                                                        address: {...formData.clientInfo.address, city: e.target.value}
                                                    }
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">State</label>
                                            <input
                                                type="text"
                                                value={formData.clientInfo.address.state}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    clientInfo: {
                                                        ...formData.clientInfo, 
                                                        address: {...formData.clientInfo.address, state: e.target.value}
                                                    }
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Country</label>
                                            <input
                                                type="text"
                                                value={formData.clientInfo.address.country}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    clientInfo: {
                                                        ...formData.clientInfo, 
                                                        address: {...formData.clientInfo.address, country: e.target.value}
                                                    }
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                                            <input
                                                type="text"
                                                value={formData.clientInfo.address.zipCode}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    clientInfo: {
                                                        ...formData.clientInfo, 
                                                        address: {...formData.clientInfo.address, zipCode: e.target.value}
                                                    }
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                                        <input
                                            type="text"
                                            value={formData.clientInfo.taxId}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                clientInfo: {...formData.clientInfo, taxId: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                                        <input
                                            type="text"
                                            value={formData.clientInfo.registrationNumber}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                clientInfo: {...formData.clientInfo, registrationNumber: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Billing Information Section */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium mb-4">Billing Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Billing Name</label>
                                        <input
                                            type="text"
                                            value={formData.billingInfo.name}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                billingInfo: {...formData.billingInfo, name: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Billing Company</label>
                                        <input
                                            type="text"
                                            value={formData.billingInfo.company}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                billingInfo: {...formData.billingInfo, company: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Billing Email</label>
                                        <input
                                            type="email"
                                            value={formData.billingInfo.email}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                billingInfo: {...formData.billingInfo, email: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Billing Phone</label>
                                        <input
                                            type="text"
                                            value={formData.billingInfo.phone}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                billingInfo: {...formData.billingInfo, phone: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <h4 className="text-md font-medium mb-2">Billing Address</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Street</label>
                                            <input
                                                type="text"
                                                value={formData.billingInfo.address.street}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    billingInfo: {
                                                        ...formData.billingInfo, 
                                                        address: {...formData.billingInfo.address, street: e.target.value}
                                                    }
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City</label>
                                            <input
                                                type="text"
                                                value={formData.billingInfo.address.city}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    billingInfo: {
                                                        ...formData.billingInfo, 
                                                        address: {...formData.billingInfo.address, city: e.target.value}
                                                    }
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">State</label>
                                            <input
                                                type="text"
                                                value={formData.billingInfo.address.state}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    billingInfo: {
                                                        ...formData.billingInfo, 
                                                        address: {...formData.billingInfo.address, state: e.target.value}
                                                    }
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Country</label>
                                            <input
                                                type="text"
                                                value={formData.billingInfo.address.country}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    billingInfo: {
                                                        ...formData.billingInfo, 
                                                        address: {...formData.billingInfo.address, country: e.target.value}
                                                    }
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                                            <input
                                                type="text"
                                                value={formData.billingInfo.address.zipCode}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    billingInfo: {
                                                        ...formData.billingInfo, 
                                                        address: {...formData.billingInfo.address, zipCode: e.target.value}
                                                    }
                                                })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tax Exempt</label>
                                        <div className="mt-1">
                                            <input
                                                type="checkbox"
                                                checked={formData.billingInfo.taxExempt}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    billingInfo: {...formData.billingInfo, taxExempt: e.target.checked}
                                                })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Tax Exempt</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                                        <input
                                            type="text"
                                            value={formData.billingInfo.paymentTerms}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                billingInfo: {...formData.billingInfo, paymentTerms: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Preferred Payment Method</label>
                                        <input
                                            type="text"
                                            value={formData.billingInfo.preferredPaymentMethod}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                billingInfo: {...formData.billingInfo, preferredPaymentMethod: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="same-as-billing"
                                        checked={sameAsBilling}
                                        onChange={(e) => {
                                            setSameAsBilling(e.target.checked);
                                            if (e.target.checked) {
                                                setFormData({
                                                    ...formData,
                                                    shippingAddress: { ...formData.billingInfo.address }
                                                });
                                            }
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="same-as-billing" className="ml-2 text-sm text-gray-600">
                                        Same as Billing Address
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                                        <input
                                            type="text"
                                            value={formData.shippingAddress?.street || ''}
                                            onChange={(e) => {
                                                const newShippingAddress = {
                                                    ...formData.shippingAddress,
                                                    street: e.target.value
                                                };
                                                setFormData({
                                                    ...formData,
                                                    shippingAddress: newShippingAddress
                                                });
                                            }}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <input
                                            type="text"
                                            value={formData.shippingAddress?.city || ''}
                                            onChange={(e) => {
                                                const newShippingAddress = {
                                                    ...formData.shippingAddress,
                                                    city: e.target.value
                                                };
                                                setFormData({
                                                    ...formData,
                                                    shippingAddress: newShippingAddress
                                                });
                                            }}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">State</label>
                                        <input
                                            type="text"
                                            value={formData.shippingAddress?.state || ''}
                                            onChange={(e) => {
                                                const newShippingAddress = {
                                                    ...formData.shippingAddress,
                                                    state: e.target.value
                                                };
                                                setFormData({
                                                    ...formData,
                                                    shippingAddress: newShippingAddress
                                                });
                                            }}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Country</label>
                                        <input
                                            type="text"
                                            value={formData.shippingAddress?.country || ''}
                                            onChange={(e) => {
                                                const newShippingAddress = {
                                                    ...formData.shippingAddress,
                                                    country: e.target.value
                                                };
                                                setFormData({
                                                    ...formData,
                                                    shippingAddress: newShippingAddress
                                                });
                                            }}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                        <input
                                            type="text"
                                            value={formData.shippingAddress?.zipCode || ''}
                                            onChange={(e) => {
                                                const newShippingAddress = {
                                                    ...formData.shippingAddress,
                                                    zipCode: e.target.value
                                                };
                                                setFormData({
                                                    ...formData,
                                                    shippingAddress: newShippingAddress
                                                });
                                            }}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Shipping Method</label>
                                        <input
                                            type="text"
                                            value={formData.shippingMethod || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                shippingMethod: e.target.value
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Shipping Cost</label>
                                        <input
                                            type="number"
                                            value={formData.shippingCost || 0}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                shippingCost: parseFloat(e.target.value) || 0
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Shipping Notes</label>
                                    <textarea
                                        rows={3}
                                        value={formData.shippingNotes || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            shippingNotes: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                currency: e.target.value
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="INR">INR</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Payment Due Date</label>
                                        <input
                                            type="date"
                                            value={formData.paymentDueDate}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                paymentDueDate: e.target.value
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                                        <input
                                            type="text"
                                            value={formData.billingInfo?.paymentTerms || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                billingInfo: {
                                                    ...formData.billingInfo,
                                                    paymentTerms: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Preferred Payment Method</label>
                                        <input
                                            type="text"
                                            value={formData.billingInfo?.preferredPaymentMethod || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                billingInfo: {
                                                    ...formData.billingInfo,
                                                    preferredPaymentMethod: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium">Items</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Item name"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                        className="rounded-md border border-gray-300 px-3 py-2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (optional)"
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                        className="rounded-md border border-gray-300 px-3 py-2"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                                        min="1"
                                        className="rounded-md border border-gray-300 px-3 py-2"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                                            min="0"
                                            className="rounded-md border border-gray-300 px-3 py-2 flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 whitespace-nowrap"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <div className="min-w-full inline-block align-middle">
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                        <th className="px-4 py-3 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {(formData.items || []).map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-3 whitespace-nowrap">{item.name}</td>
                                                            <td className="px-4 py-3">
                                                                <HighlightedText 
                                                                    text={item.description || '-'} 
                                                                    highlight={filterType === 'items' || filterType === 'all' ? searchTerm : ''} 
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                            <td className="px-4 py-3 text-right">${item.price.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right">${(item.quantity * item.price).toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItem(index)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-gray-50">
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-3 text-right font-medium">Subtotal:</td>
                                                        <td className="px-4 py-3 text-right">${calculateSubtotal().toLocaleString()}</td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-3 text-right font-medium">Discount ({formData.discount}%):</td>
                                                        <td className="px-4 py-3 text-right">-${((calculateSubtotal() * formData.discount) / 100).toLocaleString()}</td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-3 text-right font-medium">Tax ({formData.tax}%):</td>
                                                        <td className="px-4 py-3 text-right">${(((calculateSubtotal() * (1 - formData.discount/100)) * formData.tax) / 100).toLocaleString()}</td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-3 text-right font-medium">Shipping:</td>
                                                        <td className="px-4 py-3 text-right">${formData.shippingCost.toLocaleString()}</td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-3 text-right font-medium">Total Amount:</td>
                                                        <td className="px-4 py-3 text-right font-medium">${calculateTotal().toLocaleString()}</td>
                                                        <td></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                                >
                                    {quote ? 'Save Changes' : 'Create Quote'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Delete Quote Modal (First Step)
const DeleteQuoteModal = ({ isOpen, onClose, quote, onProceed }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-red-600">Delete Quote</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg">{quote?.title || quote?.quote_id}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        quote?.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                        quote?.status === 'Declined' ? 'bg-red-100 text-red-800' :
                                        quote?.status === 'Expired' ? 'bg-gray-100 text-gray-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {quote?.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-3">Client: {quote?.client?.company || quote?.client?.name || 'No Client'}</p>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Subtotal: ${quote?.amount.toLocaleString()}</p>
                                    {quote?.discount > 0 && (
                                        <p className="text-sm text-gray-600">Discount ({quote?.discount}%): -${((quote?.amount * quote?.discount) / 100).toLocaleString()}</p>
                                    )}
                                    {quote?.tax > 0 && (
                                        <p className="text-sm text-gray-600">Tax ({quote?.tax}%): ${(((quote?.amount * (1 - quote?.discount/100)) * quote?.tax) / 100).toLocaleString()}</p>
                                    )}
                                    <p className="text-sm font-medium">Total: ${quote?.total.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">Valid Until: {new Date(quote?.validUntil).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-600">Created At: {new Date(quote?.createdAt).toLocaleDateString()}</p>
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
const DeleteConfirmationDialog = ({ isOpen, onClose, quote, onConfirm }) => {
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
                        
                        <h3 className="text-xl font-bold text-center mb-2">Confirm Quote Deletion</h3>
                        <p className="text-gray-600 text-center mb-6">
                            This action cannot be undone. Please type <span className="font-semibold text-red-600">{quote?.quote_id}</span> to confirm deletion.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type quote ID to confirm"
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
                                    disabled={confirmText !== quote?.quote_id}
                                    className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 
                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Delete Quote
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const HighlightedText = ({ text, highlight }) => {
    if (!highlight?.trim()) return text;
    
    // Escape special characters in the search term
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
        <span>
            {parts.map((part, i) => 
                regex.test(part) ? (
                    <span key={i} className="bg-yellow-200 transition-colors duration-200">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

const Quotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userData, BASE_URL } = useUser();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [deleteQuote, setDeleteQuote] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [priceFilter, setPriceFilter] = useState({
        type: 'none',
        value: ''
    });
    const [dateFilter, setDateFilter] = useState({
        type: 'none',
        startDate: '',
        endDate: ''
    });
    const [clientTypeFilter, setClientTypeFilter] = useState('all');
    const [itemCountFilter, setItemCountFilter] = useState({
        type: 'none',
        value: ''
    });
    const [discountFilter, setDiscountFilter] = useState({
        type: 'none',
        value: ''
    });
    const [taxFilter, setTaxFilter] = useState({
        type: 'none',
        value: ''
    });
    const [pipelineFilter, setPipelineFilter] = useState('all');

    // Fetch clients from backend
    const fetchClients = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/clients/get-clients`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                setClients(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch clients');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('Failed to fetch clients. Please try again.');
        }
    };

    // Fetch quotes from backend
    const fetchQuotes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${BASE_URL}/quotes/get-quotes`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });

            if (response.data.success) {
                setQuotes(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch quotes');
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
            toast.error('Failed to fetch quotes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
        fetchClients();
    }, []);

    const filteredQuotes = quotes.filter(quote => {
        const searchQuery = searchTerm.toLowerCase();
        let matchesSearch = true;
        let matchesPrice = true;
        let matchesDate = true;
        let matchesClientType = true;
        let matchesItemCount = true;
        let matchesDiscount = true;
        let matchesTax = true;
        let matchesPipeline = true;
        
        // Text search
        if (searchTerm) {
            switch (filterType) {
                case 'name':
                    matchesSearch = 
                        (quote.title?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.quote_id?.toLowerCase() || '').includes(searchQuery);
                    break;
                case 'customer':
                    matchesSearch = 
                        (quote.client?.company?.toLowerCase() || '').includes(searchQuery) || 
                        (quote.client?.name?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.client?.email?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.client?.phone?.toLowerCase() || '').includes(searchQuery);
                    break;
                case 'items':
                    matchesSearch = (quote.items || []).some(item => 
                        (item.name?.toLowerCase() || '').includes(searchQuery) ||
                        (item.description?.toLowerCase() || '').includes(searchQuery)
                    );
                    break;
                case 'all':
                default:
                    matchesSearch = 
                        (quote.title?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.quote_id?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.client?.company?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.client?.name?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.client?.email?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.client?.phone?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.notes?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.terms?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.description?.toLowerCase() || '').includes(searchQuery) ||
                        (quote.items || []).some(item => 
                            (item.name?.toLowerCase() || '').includes(searchQuery) ||
                            (item.description?.toLowerCase() || '').includes(searchQuery)
                        );
            }
        }

        // Price filter
        if (priceFilter.type !== 'none' && priceFilter.value) {
            const amount = quote.total || 0;
            const filterValue = parseFloat(priceFilter.value);
            
            switch (priceFilter.type) {
                case 'eq': matchesPrice = amount === filterValue; break;
                case 'lt': matchesPrice = amount < filterValue; break;
                case 'lte': matchesPrice = amount <= filterValue; break;
                case 'gt': matchesPrice = amount > filterValue; break;
                case 'gte': matchesPrice = amount >= filterValue; break;
            }
        }

        // Date filter
        if (dateFilter.type !== 'none' && (dateFilter.startDate || dateFilter.endDate)) {
            const quoteDate = new Date(quote.createdAt || quote.validUntil);
            const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
            const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

            if (startDate) matchesDate = quoteDate >= startDate;
            if (endDate) matchesDate = matchesDate && quoteDate <= endDate;
        }

        // Client type filter
        if (clientTypeFilter !== 'all') {
            matchesClientType = quote.client?.type === clientTypeFilter;
        }
        // Item count filter
        if (itemCountFilter.type !== 'none' && itemCountFilter.value) {
            const itemCount = (quote.items || []).length;
            const filterValue = parseInt(itemCountFilter.value);
            
            switch (itemCountFilter.type) {
                case 'eq': matchesItemCount = itemCount === filterValue; break;
                case 'lt': matchesItemCount = itemCount < filterValue; break;
                case 'lte': matchesItemCount = itemCount <= filterValue; break;
                case 'gt': matchesItemCount = itemCount > filterValue; break;
                case 'gte': matchesItemCount = itemCount >= filterValue; break;
            }
        }

        // Discount filter
        if (discountFilter.type !== 'none' && discountFilter.value) {
            const discount = quote.discount || 0;
            const filterValue = parseFloat(discountFilter.value);
            
            switch (discountFilter.type) {
                case 'eq': matchesDiscount = discount === filterValue; break;
                case 'lt': matchesDiscount = discount < filterValue; break;
                case 'lte': matchesDiscount = discount <= filterValue; break;
                case 'gt': matchesDiscount = discount > filterValue; break;
                case 'gte': matchesDiscount = discount >= filterValue; break;
            }
        }

        // Tax filter
        if (taxFilter.type !== 'none' && taxFilter.value) {
            const tax = quote.tax || 0;
            const filterValue = parseFloat(taxFilter.value);
            
            switch (taxFilter.type) {
                case 'eq': matchesTax = tax === filterValue; break;
                case 'lt': matchesTax = tax < filterValue; break;
                case 'lte': matchesTax = tax <= filterValue; break;
                case 'gt': matchesTax = tax > filterValue; break;
                case 'gte': matchesTax = tax >= filterValue; break;
            }
        }

        // Pipeline filter
        if (pipelineFilter !== 'all') {
            matchesPipeline = quote.pipeline?.title === pipelineFilter;
        }

        return matchesSearch && matchesPrice && matchesDate && matchesClientType && 
               matchesItemCount && matchesDiscount && matchesTax && matchesPipeline;
    });

    const handleCreateQuote = async (newQuote) => {
        try {
            const response = await axios.post(`${BASE_URL}/quotes/create-quote`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                title: newQuote.title,
                client_id: newQuote.client_id,
                validUntil: newQuote.validUntil,
                status: newQuote.status,
                items: newQuote.items,
                notes: newQuote.notes,
                terms: newQuote.terms,
                discount: newQuote.discount,
                tax: newQuote.tax,
                total: newQuote.total,
                amount: newQuote.amount,
                clientInfo: newQuote.clientInfo,
                billingInfo: newQuote.billingInfo,
                currency: newQuote.currency,
                paymentDueDate: newQuote.paymentDueDate,
                shippingAddress: {
                    street: newQuote.shippingAddress?.street || '',
                    city: newQuote.shippingAddress?.city || '',
                    state: newQuote.shippingAddress?.state || '',
                    country: newQuote.shippingAddress?.country || '',
                    zipCode: newQuote.shippingAddress?.zipCode || ''
                },
                shippingMethod: newQuote.shippingMethod || '',
                shippingCost: newQuote.shippingCost || 0,
                shippingNotes: newQuote.shippingNotes || ''
            });

            if (response.data.success) {
                // Fetch fresh data instead of updating state directly
                await fetchQuotes();
                toast.success('Quote created successfully');
                setIsFormModalOpen(false);
            } else {
                toast.error(response.data.message || 'Failed to create quote');
            }
        } catch (error) {
            console.error('Error creating quote:', error);
            toast.error(error.response?.data?.message || 'Error creating quote');
        }
    };

    const handleUpdateQuote = async (updatedQuote) => {
        try {
            const response = await axios.post(`${BASE_URL}/quotes/update-quote`, {
                quote_id: updatedQuote.quote_id,
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                title: updatedQuote.title,
                client_id: updatedQuote.client_id,
                validUntil: updatedQuote.validUntil,
                status: updatedQuote.status,
                items: updatedQuote.items,
                notes: updatedQuote.notes,
                terms: updatedQuote.terms,
                discount: updatedQuote.discount,
                tax: updatedQuote.tax,
                total: updatedQuote.total,
                amount: updatedQuote.amount,
                clientInfo: updatedQuote.clientInfo,
                billingInfo: updatedQuote.billingInfo,
                currency: updatedQuote.currency,
                paymentDueDate: updatedQuote.paymentDueDate,
                shippingAddress: updatedQuote.shippingAddress,
                shippingMethod: updatedQuote.shippingMethod,
                shippingCost: updatedQuote.shippingCost,
                shippingNotes: updatedQuote.shippingNotes
            });
            setQuotes(quotes.map(quote => quote.quote_id === updatedQuote.quote_id ? response.data : quote));
            toast.success('Quote updated successfully');
            setIsFormModalOpen(false);
        } catch (error) {
            console.error('Error updating quote:', error);
            toast.error(error.response?.data?.message || 'Error updating quote');
        }
    };

    const handleDeleteQuote = async (quoteId) => {
        try {
            const response = await axios.post(`${BASE_URL}/quotes/delete-quote`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                quote_id: quoteId
            });

            if (response.data.success) {
                setQuotes(prev => prev.filter(q => q.quote_id !== quoteId));
                toast.success('Quote deleted successfully');
            } else {
                toast.error(response.data.message || 'Failed to delete quote');
            }
        } catch (error) {
            console.error('Error deleting quote:', error);
            toast.error('Failed to delete quote. Please try again.');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quotes</h1>
                <button 
                    onClick={() => {
                        setSelectedQuote(null);
                        setIsFormModalOpen(true);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
                >
                    <Plus size={20} />
                    Create Quote
                </button>
            </div>

            <Card className="mb-6">
                <div className="p-4 space-y-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search quotes..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
                                    showFilters ? 'bg-gray-100' : ''
                                }`}
                            >
                                <Filter size={20} />
                                Advanced Filters
                            </button>
                            {(searchTerm || filterStatus !== 'all' || priceFilter.type !== 'none' || 
                              dateFilter.type !== 'none' || clientTypeFilter !== 'all' || 
                              itemCountFilter.type !== 'none' || discountFilter.type !== 'none' || 
                              taxFilter.type !== 'none' || pipelineFilter !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterStatus('all');
                                        setFilterType('all');
                                        setPriceFilter({ type: 'none', value: '' });
                                        setDateFilter({ type: 'none', startDate: '', endDate: '' });
                                        setClientTypeFilter('all');
                                        setItemCountFilter({ type: 'none', value: '' });
                                        setDiscountFilter({ type: 'none', value: '' });
                                        setTaxFilter({ type: 'none', value: '' });
                                        setPipelineFilter('all');
                                    }}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                            {/* Basic Filters */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search Type</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="all">Search All</option>
                                    <option value="name">Quote Name</option>
                                    <option value="customer">Customer</option>
                                    <option value="items">Items</option>
                                </select>
                            </div>

                           

                           

                            {/* Price Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Total Amount</label>
                                <div className="flex gap-2">
                                    <select
                                        value={priceFilter.type}
                                        onChange={(e) => setPriceFilter(prev => ({ ...prev, type: e.target.value }))}
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    >
                                        <option value="none">No Filter</option>
                                        <option value="eq">Equal to</option>
                                        <option value="lt">Less than</option>
                                        <option value="lte">Less than or equal to</option>
                                        <option value="gt">Greater than</option>
                                        <option value="gte">Greater than or equal to</option>
                                    </select>
                                    {priceFilter.type !== 'none' && (
                                        <input
                                            type="number"
                                            value={priceFilter.value}
                                            onChange={(e) => setPriceFilter(prev => ({ ...prev, value: e.target.value }))}
                                            placeholder="Amount"
                                            className="w-32 px-3 py-2 border rounded-lg"
                                            min="0"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Date Range Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dateFilter.startDate}
                                        onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="date"
                                        value={dateFilter.endDate}
                                        onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Item Count Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Item Count</label>
                                <div className="flex gap-2">
                                    <select
                                        value={itemCountFilter.type}
                                        onChange={(e) => setItemCountFilter(prev => ({ ...prev, type: e.target.value }))}
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    >
                                        <option value="none">No Filter</option>
                                        <option value="eq">Equal to</option>
                                        <option value="lt">Less than</option>
                                        <option value="lte">Less than or equal to</option>
                                        <option value="gt">Greater than</option>
                                        <option value="gte">Greater than or equal to</option>
                                    </select>
                                    {itemCountFilter.type !== 'none' && (
                                        <input
                                            type="number"
                                            value={itemCountFilter.value}
                                            onChange={(e) => setItemCountFilter(prev => ({ ...prev, value: e.target.value }))}
                                            placeholder="Count"
                                            className="w-32 px-3 py-2 border rounded-lg"
                                            min="0"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Discount Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Discount</label>
                                <div className="flex gap-2">
                                    <select
                                        value={discountFilter.type}
                                        onChange={(e) => setDiscountFilter(prev => ({ ...prev, type: e.target.value }))}
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    >
                                        <option value="none">No Filter</option>
                                        <option value="eq">Equal to</option>
                                        <option value="lt">Less than</option>
                                        <option value="lte">Less than or equal to</option>
                                        <option value="gt">Greater than</option>
                                        <option value="gte">Greater than or equal to</option>
                                    </select>
                                    {discountFilter.type !== 'none' && (
                                        <input
                                            type="number"
                                            value={discountFilter.value}
                                            onChange={(e) => setDiscountFilter(prev => ({ ...prev, value: e.target.value }))}
                                            placeholder="%"
                                            className="w-32 px-3 py-2 border rounded-lg"
                                            min="0"
                                            max="100"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Tax Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tax</label>
                                <div className="flex gap-2">
                                    <select
                                        value={taxFilter.type}
                                        onChange={(e) => setTaxFilter(prev => ({ ...prev, type: e.target.value }))}
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    >
                                        <option value="none">No Filter</option>
                                        <option value="eq">Equal to</option>
                                        <option value="lt">Less than</option>
                                        <option value="lte">Less than or equal to</option>
                                        <option value="gt">Greater than</option>
                                        <option value="gte">Greater than or equal to</option>
                                    </select>
                                    {taxFilter.type !== 'none' && (
                                        <input
                                            type="number"
                                            value={taxFilter.value}
                                            onChange={(e) => setTaxFilter(prev => ({ ...prev, value: e.target.value }))}
                                            placeholder="%"
                                            className="w-32 px-3 py-2 border rounded-lg"
                                            min="0"
                                            max="100"
                                        />
                                    )}
                                </div>
                            </div>

                        
                        </div>
                    )}
                </div>
            </Card>

            <div className="space-y-4">
                {filteredQuotes.length > 0 ? (
                    filteredQuotes.map((quote) => (
                        <Card key={quote.quote_id || quote._id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">
                                        <HighlightedText 
                                                text={quote.title || quote.quote_id} 
                                            highlight={filterType === 'name' || filterType === 'all' ? searchTerm : ''} 
                                        />
                                    </h3>
                                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                                        quote.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                        quote.status === 'Declined' ? 'bg-red-100 text-red-800' :
                                            quote.status === 'Expired' ? 'bg-gray-100 text-gray-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                            {quote.status === 'Declined' && <XCircle size={14} />}
                                        {quote.status}
                                    </span>
                                        {quote.pipeline && (
                                            <span className="text-xs text-gray-500">
                                                From Pipeline: {quote.pipeline.title}
                                            </span>
                                        )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <User size={16} className="mr-2" />
                                        <HighlightedText 
                                                text={quote.client?.company || quote.client?.name || 'No Client'} 
                                            highlight={filterType === 'customer' || filterType === 'all' ? searchTerm : ''} 
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <DollarSign size={16} className="mr-2" />
                                            ${(quote.total || 0).toLocaleString()}
                                            {quote.discount > 0 && (
                                                <span className="ml-1 text-xs text-gray-500 align-middle">
                                                    (includes {quote.discount}% discount)
                                                </span>
                                            )}
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar size={16} className="mr-2" />
                                        Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedQuote(quote);
                                        setIsFormModalOpen(true);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit2 size={20} />
                                </button>
                                <button
                                    onClick={() => setDeleteQuote(quote)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 border-t pt-4">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="text-sm text-gray-600">
                                        <th className="text-left font-medium">Item</th>
                                            <th className="text-left font-medium">Description</th>
                                        <th className="text-right font-medium">Quantity</th>
                                        <th className="text-right font-medium">Price</th>
                                            <th className="text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                        {(quote.items || []).map((item, index) => (
                                        <tr key={index} className="text-sm">
                                            <td className="py-2">
                                                <HighlightedText 
                                                    text={item.name} 
                                                    highlight={filterType === 'items' || filterType === 'all' ? searchTerm : ''} 
                                                />
                                            </td>
                                                <td className="py-2">
                                                    <HighlightedText 
                                                        text={item.description || '-'} 
                                                        highlight={filterType === 'items' || filterType === 'all' ? searchTerm : ''} 
                                                    />
                                                </td>
                                                <td className="text-right">{item.quantity || 0}</td>
                                                <td className="text-right">${(item.price || 0).toLocaleString()}</td>
                                                <td className="text-right">${((item.quantity || 0) * (item.price || 0)).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                    <tfoot className="border-t">
                                        <tr className="text-sm">
                                            <td colSpan="4" className="py-2 text-right font-medium">Subtotal:</td>
                                            <td className="py-2 text-right">${(quote.amount || 0).toLocaleString()}</td>
                                        </tr>
                                        {quote.discount > 0 && (
                                            <tr className="text-sm">
                                                <td colSpan="4" className="py-2 text-right text-sm font-medium">Discount ({quote.discount}%):</td>
                                                <td className="py-2 text-right text-sm">-${(((quote.amount || 0) * (quote.discount || 0)) / 100).toLocaleString()}</td>
                                            </tr>
                                        )}
                                        {quote.tax > 0 && (
                                            <tr className="text-sm">
                                                <td colSpan="4" className="py-2 text-right font-medium">Tax ({quote.tax}%):</td>
                                                <td className="py-2 text-right">${((((quote.amount || 0) * (1 - (quote.discount || 0)/100)) * (quote.tax || 0)) / 100).toLocaleString()}</td>
                                            </tr>
                                        )}
                                        <tr className="text-sm font-medium">
                                            <td colSpan="4" className="py-2 text-right">Total:</td>
                                            <td className="py-2 text-right">${(quote.total || 0).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                            </table>
                                
                                {(quote.notes || quote.terms) && (
                                    <div className="mt-4 pt-4 border-t">
                                        {quote.notes && (
                                            <div className="mb-2">
                                                <h4 className="text-sm font-medium mb-1">Notes:</h4>
                                                <p className="text-sm text-gray-600">
                                                    <HighlightedText 
                                                        text={quote.notes} 
                                                        highlight={filterType === 'all' ? searchTerm : ''} 
                                                    />
                                                </p>
                                            </div>
                                        )}
                                        {quote.terms && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Terms:</h4>
                                                <p className="text-sm text-gray-600">
                                                    <HighlightedText 
                                                        text={quote.terms} 
                                                        highlight={filterType === 'all' ? searchTerm : ''} 
                                                    />
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Shipping Information */}
                            {quote.shippingAddress && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-900">Shipping Information</h4>
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p>{quote.shippingAddress.street}</p>
                                        <p>{quote.shippingAddress.city}, {quote.shippingAddress.state} {quote.shippingAddress.zipCode}</p>
                                        <p>{quote.shippingAddress.country}</p>
                                        {quote.shippingMethod && (
                                            <p className="mt-1">Method: {quote.shippingMethod}</p>
                                        )}
                                        {quote.shippingCost && (
                                            <p>Cost: {quote.currency} {(quote.shippingCost || 0).toLocaleString()}</p>
                                        )}
                                        {quote.shippingNotes && (
                                            <p className="mt-1">Notes: {quote.shippingNotes}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Information */}
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900">Payment Information</h4>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Currency: {quote.currency || 'USD'}</p>
                                    {quote.paymentDueDate && (
                                        <p>Due Date: {new Date(quote.paymentDueDate).toLocaleDateString()}</p>
                                    )}
                                    {quote.billingInfo && (
                                        <>
                                            <p className="mt-1">Billing Address:</p>
                                            <p>{quote.billingInfo.address.street}</p>
                                            <p>{quote.billingInfo.address.city}, {quote.billingInfo.address.state} {quote.billingInfo.address.zipCode}</p>
                                            <p>{quote.billingInfo.address.country}</p>
                                            {quote.billingInfo.paymentTerms && (
                                                <p className="mt-1">Payment Terms: {quote.billingInfo.paymentTerms}</p>
                                            )}
                                            {quote.billingInfo.preferredPaymentMethod && (
                                                <p>Preferred Payment Method: {quote.billingInfo.preferredPaymentMethod}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                        </div>
                    </Card>
                    ))
                ) : (
                    <Card className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <FileText size={48} className="text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No quotes found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || filterStatus !== 'all' || priceFilter.type !== 'none' 
                                    ? "Try adjusting your filters or search criteria" 
                                    : "Create your first quote to get started"}
                            </p>
                            {!searchTerm && filterStatus === 'all' && priceFilter.type === 'none' && (
                                <button
                                    onClick={() => {
                                        setSelectedQuote(null);
                                        setIsFormModalOpen(true);
                                    }}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
                                >
                                    <Plus size={20} />
                                    Create Quote
                                </button>
                            )}
                        </div>
                    </Card>
                )}
            </div>

            <QuoteFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedQuote(null);
                }}
                onSubmit={selectedQuote ? handleUpdateQuote : handleCreateQuote}
                quote={selectedQuote}
                clients={clients}
            />

            <DeleteQuoteModal
                isOpen={!!deleteQuote && !showDeleteConfirm}
                onClose={() => setDeleteQuote(null)}
                quote={deleteQuote}
                onProceed={() => setShowDeleteConfirm(true)}
            />

            <DeleteConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteQuote(null);
                }}
                quote={deleteQuote}
                onConfirm={() => {
                    handleDeleteQuote(deleteQuote.quote_id);
                    setShowDeleteConfirm(false);
                    setDeleteQuote(null);
                }}
            />
        </div>
    );
};

export default Quotes; 
