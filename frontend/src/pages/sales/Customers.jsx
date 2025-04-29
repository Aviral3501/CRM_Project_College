import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Plus, Search, Filter, Mail, Phone, Building, MapPin, MoreVertical, X, Edit2, Trash2, AlertTriangle, Calendar, User, Briefcase, Globe, Tag, FileText, DollarSign, Clock, Star, Users, FileUp, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useUser } from '../../context/UserContext';

// HighlightedText component for search results
const HighlightedText = ({ text, highlight }) => {
    if (!highlight) return <span>{text}</span>;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => 
                part.toLowerCase() === highlight.toLowerCase() ? 
                    <span key={i} className="bg-yellow-200">{part}</span> : 
                    part
            )}
        </span>
    );
};

// Customer Form Modal (used for creating new clients only)
const CustomerFormModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
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
        status: 'prospect',
        businessDetails: {
            companySize: '',
            annualRevenue: '',
            fiscalYearEnd: '',
            taxId: '',
            registrationNumber: ''
        },
        contacts: [],
        preferences: {
            preferredContactMethod: 'email',
            preferredLanguage: '',
            timezone: '',
            communicationFrequency: 'monthly'
        },
        financialInfo: {
            creditLimit: '',
            paymentTerms: '',
            preferredPaymentMethod: '',
            taxExempt: false,
            billingAddress: {
                street: '',
                city: '',
                state: '',
                country: '',
                zipCode: ''
            }
        },
        relationshipInfo: {
            clientSince: '',
            lastContactDate: '',
            nextFollowUpDate: '',
            assignedAccountManager: '',
            priority: 'medium'
        },
        notes: '',
        tags: []
    });

    const [tagInput, setTagInput] = useState('');
    const [newContact, setNewContact] = useState({
        name: '',
        position: '',
        email: '',
        phone: '',
        isPrimary: false
    });
    const [showContactForm, setShowContactForm] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
            ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleAddContact = () => {
        if (newContact.name && newContact.email) {
            setFormData({
                ...formData,
                contacts: [...formData.contacts, { ...newContact }]
            });
            setNewContact({
                name: '',
                position: '',
                email: '',
                phone: '',
                isPrimary: false
            });
            setShowContactForm(false);
        }
    };

    const handleRemoveContact = (index) => {
        setFormData({
            ...formData,
            contacts: formData.contacts.filter((_, i) => i !== index)
        });
    };

    const setPrimaryContact = (index) => {
        setFormData({
            ...formData,
            contacts: formData.contacts.map((contact, i) => ({
                ...contact,
                isPrimary: i === index
            }))
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Client</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Company *</label>
                                <input
                                    type="text"
                                    required
                                            value={formData.company}
                                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Industry</label>
                                <input
                                    type="text"
                                            value={formData.industry}
                                            onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Website</label>
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({...formData, website: e.target.value})}
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
                                            <option value="prospect">Prospect</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <select
                                            value={formData.relationshipInfo.priority}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                relationshipInfo: {
                                                    ...formData.relationshipInfo,
                                                    priority: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="vip">VIP</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Street</label>
                                        <input
                                            type="text"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                address: {...formData.address, street: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <input
                                            type="text"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                address: {...formData.address, city: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">State</label>
                                        <input
                                            type="text"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                address: {...formData.address, state: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Country</label>
                                        <input
                                            type="text"
                                            value={formData.address.country}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                address: {...formData.address, country: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                                        <input
                                            type="text"
                                            value={formData.address.zipCode}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                address: {...formData.address, zipCode: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Business Details Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Business Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company Size</label>
                                        <input
                                            type="text"
                                            value={formData.businessDetails.companySize}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                businessDetails: {
                                                    ...formData.businessDetails, 
                                                    companySize: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Annual Revenue</label>
                                <input
                                    type="number"
                                            value={formData.businessDetails.annualRevenue}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                businessDetails: {
                                                    ...formData.businessDetails, 
                                                    annualRevenue: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                                        <input
                                            type="text"
                                            value={formData.businessDetails.taxId}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                businessDetails: {
                                                    ...formData.businessDetails, 
                                                    taxId: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                                        <input
                                            type="text"
                                            value={formData.businessDetails.registrationNumber}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                businessDetails: {
                                                    ...formData.businessDetails, 
                                                    registrationNumber: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contacts Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-semibold">Contacts</h3>
                                    <button 
                                        type="button"
                                        onClick={() => setShowContactForm(!showContactForm)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        {showContactForm ? 'Cancel' : 'Add Contact'}
                                    </button>
                                </div>

                                {showContactForm && (
                                    <div className="mb-4 p-3 border border-gray-200 rounded-md bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Name *</label>
                                                <input
                                                    type="text"
                                    required
                                                    value={newContact.name}
                                                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Position</label>
                                                <input
                                                    type="text"
                                                    value={newContact.position}
                                                    onChange={(e) => setNewContact({...newContact, position: e.target.value})}
                                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={newContact.email}
                                                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={newContact.phone}
                                                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={newContact.isPrimary}
                                                        onChange={(e) => setNewContact({...newContact, isPrimary: e.target.checked})}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Primary Contact</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleAddContact}
                                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Add Contact
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {formData.contacts.length > 0 ? (
                                    <div className="space-y-2">
                                        {formData.contacts.map((contact, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
                                                <div>
                                                    <div className="font-medium">{contact.name} {contact.isPrimary && <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Primary</span>}</div>
                                                    <div className="text-sm text-gray-600">{contact.position}</div>
                                                    <div className="text-sm text-gray-600">{contact.email}</div>
                                                    {contact.phone && <div className="text-sm text-gray-600">{contact.phone}</div>}
                                                </div>
                                                <div className="flex space-x-2">
                                                    {!contact.isPrimary && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPrimaryContact(index)}
                                                            className="text-xs text-blue-600 hover:text-blue-800"
                                                        >
                                                            Set Primary
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveContact(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No contacts added yet.</p>
                                )}
                            </div>

                            {/* Financial Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Financial Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
                                        <input
                                            type="number"
                                            value={formData.financialInfo.creditLimit}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                financialInfo: {
                                                    ...formData.financialInfo, 
                                                    creditLimit: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                                        <input
                                            type="text"
                                            value={formData.financialInfo.paymentTerms}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                financialInfo: {
                                                    ...formData.financialInfo, 
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
                                            value={formData.financialInfo.preferredPaymentMethod}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                financialInfo: {
                                                    ...formData.financialInfo, 
                                                    preferredPaymentMethod: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center mt-1">
                                            <input
                                                type="checkbox"
                                                checked={formData.financialInfo.taxExempt}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    financialInfo: {
                                                        ...formData.financialInfo, 
                                                        taxExempt: e.target.checked
                                                    }
                                                })}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Tax Exempt</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Relationship Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Relationship Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Client Since</label>
                                        <input
                                            type="date"
                                            value={formData.relationshipInfo.clientSince}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                relationshipInfo: {
                                                    ...formData.relationshipInfo, 
                                                    clientSince: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Next Follow-up Date</label>
                                        <input
                                            type="date"
                                            value={formData.relationshipInfo.nextFollowUpDate}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                relationshipInfo: {
                                                    ...formData.relationshipInfo, 
                                                    nextFollowUpDate: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preferences Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Preferences</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Preferred Contact Method</label>
                                        <select
                                            value={formData.preferences.preferredContactMethod}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                preferences: {
                                                    ...formData.preferences, 
                                                    preferredContactMethod: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="email">Email</option>
                                            <option value="phone">Phone</option>
                                            <option value="in-person">In Person</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Communication Frequency</label>
                                        <select
                                            value={formData.preferences.communicationFrequency}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                preferences: {
                                                    ...formData.preferences, 
                                                    communicationFrequency: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Notes and Tags Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Notes & Tags</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            rows="3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.tags.map((tag, index) => (
                                                <span 
                                                    key={index} 
                                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                                                >
                                                    {tag}
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddTag();
                                                    }
                                                }}
                                                placeholder="Add a tag and press Enter"
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                            <button 
                                                type="button"
                                                onClick={handleAddTag}
                                                className="mt-1 ml-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
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
                                    Add Client
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
                            <h2 className="text-xl font-bold text-red-600">Delete Client</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg">{customer?.name}</h3>
                                <p className="text-gray-600">{customer?.company}</p>
                                <div className="mt-2 space-y-2">
                                    <p className="text-sm text-gray-600">Email: {customer?.email}</p>
                                    <p className="text-sm text-gray-600">Phone: {customer?.phone}</p>
                                    <p className="text-sm text-gray-600">
                                        Address: {customer?.address?.street}, {customer?.address?.city}, {customer?.address?.state}, {customer?.address?.country} {customer?.address?.zipCode}
                                    </p>
                                    <p className="text-sm text-gray-600">Industry: {customer?.industry}</p>
                                    <p className="text-sm text-gray-600">Website: {customer?.website}</p>
                                    <p className="text-sm text-gray-600">Status: {customer?.status}</p>
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
    
    // Reset the confirmation text when the modal is closed
    useEffect(() => {
        if (!isOpen) {
            setConfirmText('');
        }
    }, [isOpen]);
    
    const handleConfirm = () => {
        onConfirm();
        setConfirmText(''); // Reset the confirmation text after successful deletion
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
                        <div className="flex justify-center text-red-500 mb-4">
                            <AlertTriangle size={48} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-center mb-2">Confirm Client Deletion</h3>
                        <p className="text-gray-600 text-center mb-6">
                            This action cannot be undone. Please type <span className="font-semibold text-red-600">{customer?.name}</span> to confirm deletion.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type client name to confirm"
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
                                    onClick={handleConfirm}
                                    disabled={confirmText !== customer?.name}
                                    className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 
                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Delete Client
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Edit Customer Modal (used for editing existing clients only)
const EditCustomerModal = ({ isOpen, onClose, onSubmit, customer }) => {
    const [formData, setFormData] = useState({
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
        status: 'prospect',
        businessDetails: {
            companySize: '',
            annualRevenue: '',
            fiscalYearEnd: '',
            taxId: '',
            registrationNumber: ''
        },
        contacts: [],
        preferences: {
            preferredContactMethod: 'email',
            preferredLanguage: '',
            timezone: '',
            communicationFrequency: 'monthly'
        },
        financialInfo: {
            creditLimit: '',
            paymentTerms: '',
            preferredPaymentMethod: '',
            taxExempt: false,
            billingAddress: {
                street: '',
                city: '',
                state: '',
                country: '',
                zipCode: ''
            }
        },
        relationshipInfo: {
            clientSince: '',
            lastContactDate: '',
            nextFollowUpDate: '',
            assignedAccountManager: '',
            priority: 'medium'
        },
        notes: '',
        tags: []
    });

    const [tagInput, setTagInput] = useState('');
    const [newContact, setNewContact] = useState({
        name: '',
        position: '',
        email: '',
        phone: '',
        isPrimary: false
    });
    const [showContactForm, setShowContactForm] = useState(false);

    // Prefill form data when customer data is available
    useEffect(() => {
        if (customer) {
            // Create a deep copy of the customer data
            const customerData = JSON.parse(JSON.stringify(customer));
            
            // Ensure all nested objects exist
            if (!customerData.address) customerData.address = { street: '', city: '', state: '', country: '', zipCode: '' };
            if (!customerData.businessDetails) customerData.businessDetails = { companySize: '', annualRevenue: '', fiscalYearEnd: '', taxId: '', registrationNumber: '' };
            if (!customerData.contacts) customerData.contacts = [];
            if (!customerData.preferences) customerData.preferences = { preferredContactMethod: 'email', preferredLanguage: '', timezone: '', communicationFrequency: 'monthly' };
            if (!customerData.financialInfo) customerData.financialInfo = { 
                creditLimit: '', 
                paymentTerms: '', 
                preferredPaymentMethod: '', 
                taxExempt: false,
                billingAddress: { street: '', city: '', state: '', country: '', zipCode: '' }
            };
            if (!customerData.relationshipInfo) customerData.relationshipInfo = { 
                clientSince: '', 
                lastContactDate: '', 
                nextFollowUpDate: '', 
                assignedAccountManager: '', 
                priority: 'medium' 
            };
            if (!customerData.tags) customerData.tags = [];
            
            // Replace empty values with hyphens
            Object.keys(customerData).forEach(key => {
                if (typeof customerData[key] === 'string' && customerData[key] === '') {
                    customerData[key] = '-';
                }
            });
            
            // Handle nested objects
            if (customerData.address) {
                Object.keys(customerData.address).forEach(key => {
                    if (customerData.address[key] === '') {
                        customerData.address[key] = '-';
                    }
                });
            }
            
            if (customerData.businessDetails) {
                Object.keys(customerData.businessDetails).forEach(key => {
                    if (customerData.businessDetails[key] === '') {
                        customerData.businessDetails[key] = '-';
                    }
                });
            }
            
            if (customerData.financialInfo) {
                Object.keys(customerData.financialInfo).forEach(key => {
                    if (typeof customerData.financialInfo[key] === 'string' && customerData.financialInfo[key] === '') {
                        customerData.financialInfo[key] = '-';
                    }
                });
                
                if (customerData.financialInfo.billingAddress) {
                    Object.keys(customerData.financialInfo.billingAddress).forEach(key => {
                        if (customerData.financialInfo.billingAddress[key] === '') {
                            customerData.financialInfo.billingAddress[key] = '-';
                        }
                    });
                }
            }
            
            if (customerData.relationshipInfo) {
                Object.keys(customerData.relationshipInfo).forEach(key => {
                    if (typeof customerData.relationshipInfo[key] === 'string' && customerData.relationshipInfo[key] === '') {
                        customerData.relationshipInfo[key] = '-';
                    }
                });
            }
            
            setFormData(customerData);
        }
    }, [customer]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Replace hyphens with empty strings before submitting
        const submissionData = JSON.parse(JSON.stringify(formData));
        
        Object.keys(submissionData).forEach(key => {
            if (typeof submissionData[key] === 'string' && submissionData[key] === '-') {
                submissionData[key] = '';
            }
        });
        
        if (submissionData.address) {
            Object.keys(submissionData.address).forEach(key => {
                if (submissionData.address[key] === '-') {
                    submissionData.address[key] = '';
                }
            });
        }
        
        if (submissionData.businessDetails) {
            Object.keys(submissionData.businessDetails).forEach(key => {
                if (submissionData.businessDetails[key] === '-') {
                    submissionData.businessDetails[key] = '';
                }
            });
        }
        
        if (submissionData.financialInfo) {
            Object.keys(submissionData.financialInfo).forEach(key => {
                if (typeof submissionData.financialInfo[key] === 'string' && submissionData.financialInfo[key] === '-') {
                    submissionData.financialInfo[key] = '';
                }
            });
            
            if (submissionData.financialInfo.billingAddress) {
                Object.keys(submissionData.financialInfo.billingAddress).forEach(key => {
                    if (submissionData.financialInfo.billingAddress[key] === '-') {
                        submissionData.financialInfo.billingAddress[key] = '';
                    }
                });
            }
        }
        
        if (submissionData.relationshipInfo) {
            Object.keys(submissionData.relationshipInfo).forEach(key => {
                if (typeof submissionData.relationshipInfo[key] === 'string' && submissionData.relationshipInfo[key] === '-') {
                    submissionData.relationshipInfo[key] = '';
                }
            });
        }
        
        onSubmit(submissionData);

        console.log("submissionData", submissionData);
        onClose();
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleAddContact = () => {
        if (newContact.name && newContact.email) {
            setFormData({
                ...formData,
                contacts: [...formData.contacts, { ...newContact }]
            });
            setNewContact({
                name: '',
                position: '',
                email: '',
                phone: '',
                isPrimary: false
            });
            setShowContactForm(false);
        }
    };

    const handleRemoveContact = (index) => {
        setFormData({
            ...formData,
            contacts: formData.contacts.filter((_, i) => i !== index)
        });
    };

    const setPrimaryContact = (index) => {
        setFormData({
            ...formData,
            contacts: formData.contacts.map((contact, i) => ({
                ...contact,
                isPrimary: i === index
            }))
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">


                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
                    >

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Edit Client</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>


                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Company *</label>
                                <input
                                    type="text"
                                    required
                                            value={formData.company}
                                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Industry</label>
                                <input
                                    type="text"
                                            value={formData.industry}
                                            onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Website</label>
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({...formData, website: e.target.value})}
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
                                            <option value="prospect">Prospect</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <select
                                            value={formData.relationshipInfo.priority}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                relationshipInfo: {
                                                    ...formData.relationshipInfo,
                                                    priority: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="vip">VIP</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Street</label>
                                        <input
                                            type="text"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                address: {...formData.address, street: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <input
                                            type="text"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                address: {...formData.address, city: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">State</label>
                                        <input
                                            type="text"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                address: {...formData.address, state: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Country</label>
                                        <input
                                            type="text"
                                            value={formData.address.country}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                address: {...formData.address, country: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                                        <input
                                            type="text"
                                            value={formData.address.zipCode}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                address: {...formData.address, zipCode: e.target.value}
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Business Details Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Business Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company Size</label>
                                        <input
                                            type="text"
                                            value={formData.businessDetails.companySize}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                businessDetails: {
                                                    ...formData.businessDetails, 
                                                    companySize: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Annual Revenue</label>
                                <input
                                    type="number"
                                            value={formData.businessDetails.annualRevenue}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                businessDetails: {
                                                    ...formData.businessDetails, 
                                                    annualRevenue: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                                        <input
                                            type="text"
                                            value={formData.businessDetails.taxId}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                businessDetails: {
                                                    ...formData.businessDetails, 
                                                    taxId: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                                        <input
                                            type="text"
                                            value={formData.businessDetails.registrationNumber}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                businessDetails: {
                                                    ...formData.businessDetails, 
                                                    registrationNumber: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contacts Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-semibold">Contacts</h3>
                                    <button 
                                        type="button"
                                        onClick={() => setShowContactForm(!showContactForm)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        {showContactForm ? 'Cancel' : 'Add Contact'}
                                    </button>
                                </div>

                                {showContactForm && (
                                    <div className="mb-4 p-3 border border-gray-200 rounded-md bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Name *</label>
                                                <input
                                                    type="text"
                                    required
                                                    value={newContact.name}
                                                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Position</label>
                                                <input
                                                    type="text"
                                                    value={newContact.position}
                                                    onChange={(e) => setNewContact({...newContact, position: e.target.value})}
                                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={newContact.email}
                                                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={newContact.phone}
                                                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={newContact.isPrimary}
                                                        onChange={(e) => setNewContact({...newContact, isPrimary: e.target.checked})}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Primary Contact</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleAddContact}
                                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Add Contact
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {formData.contacts.length > 0 ? (
                                    <div className="space-y-2">
                                        {formData.contacts.map((contact, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
                                                <div>
                                                    <div className="font-medium">{contact.name} {contact.isPrimary && <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Primary</span>}</div>
                                                    <div className="text-sm text-gray-600">{contact.position}</div>
                                                    <div className="text-sm text-gray-600">{contact.email}</div>
                                                    {contact.phone && <div className="text-sm text-gray-600">{contact.phone}</div>}
                                                </div>
                                                <div className="flex space-x-2">
                                                    {!contact.isPrimary && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPrimaryContact(index)}
                                                            className="text-xs text-blue-600 hover:text-blue-800"
                                                        >
                                                            Set Primary
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveContact(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No contacts added yet.</p>
                                )}
                            </div>

                            {/* Financial Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Financial Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
                                        <input
                                            type="number"
                                            value={formData.financialInfo.creditLimit}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                financialInfo: {
                                                    ...formData.financialInfo, 
                                                    creditLimit: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                                        <input
                                            type="text"
                                            value={formData.financialInfo.paymentTerms}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                financialInfo: {
                                                    ...formData.financialInfo, 
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
                                            value={formData.financialInfo.preferredPaymentMethod}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                financialInfo: {
                                                    ...formData.financialInfo, 
                                                    preferredPaymentMethod: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center mt-1">
                                            <input
                                                type="checkbox"
                                                checked={formData.financialInfo.taxExempt}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    financialInfo: {
                                                        ...formData.financialInfo, 
                                                        taxExempt: e.target.checked
                                                    }
                                                })}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Tax Exempt</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Relationship Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Relationship Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Client Since</label>
                                        <input
                                            type="date"
                                            value={formData.relationshipInfo.clientSince}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                relationshipInfo: {
                                                    ...formData.relationshipInfo, 
                                                    clientSince: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Next Follow-up Date</label>
                                        <input
                                            type="date"
                                            value={formData.relationshipInfo.nextFollowUpDate}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                relationshipInfo: {
                                                    ...formData.relationshipInfo, 
                                                    nextFollowUpDate: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preferences Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Preferences</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Preferred Contact Method</label>
                                        <select
                                            value={formData.preferences.preferredContactMethod}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                preferences: {
                                                    ...formData.preferences, 
                                                    preferredContactMethod: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="email">Email</option>
                                            <option value="phone">Phone</option>
                                            <option value="in-person">In Person</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Communication Frequency</label>
                                        <select
                                            value={formData.preferences.communicationFrequency}
                                            onChange={(e) => setFormData({
                                                ...formData, 
                                                preferences: {
                                                    ...formData.preferences, 
                                                    communicationFrequency: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Notes and Tags Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">Notes & Tags</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            rows="3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.tags.map((tag, index) => (
                                                <span 
                                                    key={index} 
                                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                                                >
                                                    {tag}
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddTag();
                                                    }
                                                }}
                                                placeholder="Add a tag and press Enter"
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                            />
                                            <button 
                                                type="button"
                                                onClick={handleAddTag}
                                                className="mt-1 ml-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
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
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const Customers = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [deleteClient, setDeleteClient] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        industry: '',
        city: '',
        communicationFrequency: 'all',
        tags: '',
        text: ''
    });

    const { userData, BASE_URL } = useUser();

    

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URL}/clients/get-clients`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id
            });
            
            if (response.data.success) {
                setClients(response.data.data);
            } else {
                setError('Failed to fetch clients');
                toast.error('Failed to fetch clients');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            setError('Error fetching clients');
            toast.error('Error fetching clients');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = async (clientData) => {
        try {
            const response = await axios.post(`${BASE_URL}/clients/create-client`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                ...clientData
            });
            
            if (response.data.success) {
                toast.success('Client added successfully');
                fetchClients();
                // Close the modal and clear states only on success
                setIsFormModalOpen(false);
                // Reset any form data if needed
            } else {
                toast.error('Failed to add client');
            }
        } catch (error) {
            console.error('Error adding client:', error);
            
            // Check for specific error messages
            if (error.response && error.response.data && error.response.data.message) {
                if (error.response.data.message.includes("email already exists")) {
                    toast.error('A client with this email already exists');
                } else {
                    toast.error(error.response.data.message);
                }
            } else {
                toast.error('Error adding client');
            }
        }
    };

    const handleUpdateClient = async (clientData) => {
        console.log("clientData111", clientData);

        const {
            _id, createdBy, updatedBy, organization, createdAt, updatedAt, __v,
            documents, dealHistory, communicationHistory,
            ...sanitizedData
        } = clientData;

        console.log("sanitizedData", sanitizedData);
        try {
            const response = await axios.post(`${BASE_URL}/clients/update-client`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                client_id: clientData.client_id,
                ...sanitizedData
            });
            
            if (response.data.success) {
                toast.success('Client updated successfully');
                fetchClients();
            } else {
                toast.error('Failed to update client');
            }
        } catch (error) {
            console.error('Error updating client:', error);
            toast.error('Error updating client');
        }
    };

    const handleDeleteClient = async (clientId) => {
        try {
            const response = await axios.post(`${BASE_URL}/clients/delete-client`, {
                organization_id: userData.organization_id,
                user_id: userData.user_id,
                client_id: clientId
            });
            
            if (response.data.success) {
                toast.success('Client deleted successfully');
                fetchClients();
            } else {
                toast.error('Failed to delete client');
            }
        } catch (error) {
            console.error('Error deleting client:', error);
            toast.error('Error deleting client');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.client-menu')) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Helper to get unique values for dropdowns
    const uniqueValues = (key) => {
        const values = clients.map(c => {
            if (key === 'city') return c.address?.city || '';
            if (key === 'industry') return c.industry || '';
            if (key === 'priority') return c.relationshipInfo?.priority || '';
            if (key === 'communicationFrequency') return c.preferences?.communicationFrequency || '';
            return c[key] || '';
        }).filter(Boolean);
        return [...new Set(values)];
    };

    // Updated filtering logic
    const filteredClients = clients.filter(client => {
        // Textual search
        const textMatch = filters.text === '' || [
            client.name, client.company, client.email, client.phone
        ].some(val => val?.toLowerCase().includes(filters.text.toLowerCase()));

        // Status
        const statusMatch = filters.status === 'all' || client.status === filters.status;

        // Priority
        const priorityMatch = filters.priority === 'all' || (client.relationshipInfo?.priority === filters.priority);

        // Industry
        const industryMatch = !filters.industry || client.industry === filters.industry;

        // City
        const cityMatch = !filters.city || client.address?.city === filters.city;

        // Communication Frequency
        const commFreqMatch = filters.communicationFrequency === 'all' || 
            (client.preferences?.communicationFrequency === filters.communicationFrequency);

        // Tags (comma separated, match any)
        const tagsMatch = !filters.tags || filters.tags.split(',').some(tag =>
            client.tags?.map(t => t.toLowerCase()).includes(tag.trim().toLowerCase())
        );

        return textMatch && statusMatch && priorityMatch && industryMatch && cityMatch && commFreqMatch && tagsMatch;
    });

    const handleEditClient = (client) => {
        setSelectedClient(client);
        setIsEditModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Clients</h1>
                <button 
                    onClick={() => {
                        setSelectedClient(null);
                        setIsFormModalOpen(true);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
                >
                    <Plus size={20} />
                    Add Client
                </button>
            </div>

            <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={filters.text}
                            onChange={(e) => setFilters(f => ({...f, text: e.target.value}))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                    <button
                        onClick={() => setShowAdvancedFilters(v => !v)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
                    >
                        <Filter size={20} />
                         Filter {showAdvancedFilters ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                </div>

                {showAdvancedFilters && (
                    <div className="bg-white border rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                value={filters.status} 
                                onChange={e => setFilters(f => ({...f, status: e.target.value}))}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="prospect">Prospect</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select 
                                value={filters.priority} 
                                onChange={e => setFilters(f => ({...f, priority: e.target.value}))}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Priorities</option>
                                {uniqueValues('priority').map(p => (
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                            <select 
                                value={filters.industry} 
                                onChange={e => setFilters(f => ({...f, industry: e.target.value}))}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Industries</option>
                                {uniqueValues('industry').map(i => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <select 
                                value={filters.city} 
                                onChange={e => setFilters(f => ({...f, city: e.target.value}))}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Cities</option>
                                {uniqueValues('city').map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Communication Frequency</label>
                            <select 
                                value={filters.communicationFrequency} 
                                onChange={e => setFilters(f => ({...f, communicationFrequency: e.target.value}))}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Frequencies</option>
                                {uniqueValues('communicationFrequency').map(cf => (
                                    <option key={cf} value={cf}>{cf.charAt(0).toUpperCase() + cf.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <input
                                type="text"
                                value={filters.tags}
                                onChange={e => setFilters(f => ({...f, tags: e.target.value}))}
                                placeholder="Comma separated tags"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 flex justify-end">
                            <button
                                onClick={() => setFilters({
                                    status: 'all',
                                    priority: 'all',
                                    industry: '',
                                    city: '',
                                    communicationFrequency: 'all',
                                    tags: '',
                                    text: ''
                                })}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No clients found</p>
                    <button 
                        onClick={() => {
                            setFilters({
                                status: 'all',
                                priority: 'all',
                                industry: '',
                                city: '',
                                communicationFrequency: 'all',
                                tags: '',
                                text: ''
                            });
                        }}
                        className="mt-4 text-blue-500 hover:text-blue-700"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <Card key={client.client_id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                    <h3 className="text-lg font-semibold">
                                        <HighlightedText text={client.name} highlight={filters.text} />
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        <HighlightedText text={client.company} highlight={filters.text} />
                                    </p>
                            </div>
                                <div className="relative client-menu">
                                <button 
                                        onClick={() => setOpenMenuId(openMenuId === client.client_id ? null : client.client_id)}
                                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                >
                                    <MoreVertical size={20} />
                                </button>
                                    {openMenuId === client.client_id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                                    >
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                        handleEditClient(client);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <Edit2 size={16} />
                                                    Edit Client
                                            </button>
                                            <button
                                                onClick={() => {
                                                        setDeleteClient(client);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                    Delete Client
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <HighlightedText text={client.email} highlight={filters.text} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <HighlightedText text={client.phone} highlight={filters.text} />
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin size={16} className="mr-2" />
                                    {client.address?.street}, {client.address?.city}, {client.address?.state}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Building size={16} className="mr-2" />
                                    {client.industry}
                            </div>
                        </div>

                            {client.tags && client.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {client.tags.map((tag, index) => (
                                        <span 
                                            key={index} 
                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                        client.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                            : client.status === 'inactive'
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                </span>
                                <span className="text-sm text-gray-500">
                                        {new Date(client.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            )}

            <CustomerFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedClient(null);
                }}
                onSubmit={handleAddClient}
            />

            <EditCustomerModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedClient(null);
                }}
                onSubmit={handleUpdateClient}
                customer={selectedClient}
            />

            <DeleteCustomerModal
                isOpen={!!deleteClient && !showDeleteConfirm}
                onClose={() => setDeleteClient(null)}
                customer={deleteClient}
                onProceed={() => setShowDeleteConfirm(true)}
            />

            <DeleteConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteClient(null);
                }}
                customer={deleteClient}
                onConfirm={() => {
                    handleDeleteClient(deleteClient.client_id);
                    setShowDeleteConfirm(false);
                    setDeleteClient(null);
                }}
            />
        </div>
    );
};

export default Customers; 