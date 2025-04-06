import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Plus, Search, Filter, Download, Eye, DollarSign, Calendar, User, X, AlertTriangle, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Create/Edit Quote Modal
const QuoteFormModal = ({ isOpen, onClose, onSubmit, quote = null }) => {
    const [formData, setFormData] = useState({
        customer: '',
        validUntil: new Date().toISOString().split('T')[0],
        status: 'Pending',
        items: []
    });
    const [newItem, setNewItem] = useState({ name: '', quantity: 1, price: 0 });

    useEffect(() => {
        if (quote) {
            setFormData(quote);
        }
    }, [quote]);

    const addItem = () => {
        if (newItem.name && newItem.price > 0) {
            setFormData(prev => ({
                ...prev,
                items: [...prev.items, { ...newItem }]
            }));
            setNewItem({ name: '', quantity: 1, price: 0 });
        }
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const total = calculateTotal();
        onSubmit({
            ...formData,
            id: quote?.id || `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            amount: total,
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
                        className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{quote ? 'Edit Quote' : 'Create New Quote'}</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customer}
                                        onChange={(e) => setFormData({...formData, customer: e.target.value})}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </div>
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
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium">Items</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Item name"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
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
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                        <th className="px-4 py-3 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {formData.items.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-3 whitespace-nowrap">{item.name}</td>
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
                                                        <td colSpan="3" className="px-4 py-3 text-right font-medium">Total Amount:</td>
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
                                    <h3 className="font-semibold text-lg">{quote?.id}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        quote?.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                        quote?.status === 'Declined' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {quote?.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-3">Customer: {quote?.customer}</p>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Amount: ${quote?.amount.toLocaleString()}</p>
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
                            This action cannot be undone. Please type <span className="font-semibold text-red-600">{quote?.id}</span> to confirm deletion.
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
                                    disabled={confirmText !== quote?.id}
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
    if (!highlight.trim()) return text;
    
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
    const [quotes, setQuotes] = useState([
        {
            id: 'QT-2024-001',
            customer: 'Tech Corp',
            amount: 50000,
            status: 'Pending',
            validUntil: '2024-04-30',
            createdAt: '2024-03-15',
            items: [
                { name: 'Web Development', quantity: 1, price: 30000 },
                { name: 'UI/UX Design', quantity: 1, price: 20000 }
            ]
        },
        {
            id: 'QT-2024-002',
            customer: 'Design Co',
            amount: 25000,
            status: 'Accepted',
            validUntil: '2024-04-25',
            createdAt: '2024-03-10',
            items: [
                { name: 'Brand Design', quantity: 1, price: 15000 },
                { name: 'Marketing Materials', quantity: 1, price: 10000 }
            ]
        },
        {
            id: 'QT-2024-003',
            customer: 'Software Inc',
            amount: 75000,
            status: 'Declined',
            validUntil: '2024-04-20',
            createdAt: '2024-03-05',
            items: [
                { name: 'Software License', quantity: 5, price: 15000 }
            ]
        }
    ]);
    
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

    const filteredQuotes = quotes.filter(quote => {
        const searchQuery = searchTerm.toLowerCase();
        let matchesSearch = true;
        let matchesPrice = true;
        
        // Text search
        if (searchTerm) {
            switch (filterType) {
                case 'name':
                    matchesSearch = quote.id.toLowerCase().includes(searchQuery);
                    break;
                case 'customer':
                    matchesSearch = quote.customer.toLowerCase().includes(searchQuery);
                    break;
                case 'items':
                    matchesSearch = quote.items.some(item => 
                        item.name.toLowerCase().includes(searchQuery)
                    );
                    break;
                case 'all':
                default:
                    matchesSearch = quote.id.toLowerCase().includes(searchQuery) ||
                                  quote.customer.toLowerCase().includes(searchQuery) ||
                                  quote.items.some(item => 
                                      item.name.toLowerCase().includes(searchQuery)
                                  );
            }
        }

        // Price filter
        if (priceFilter.type !== 'none' && priceFilter.value) {
            const amount = quote.amount;
            const filterValue = parseFloat(priceFilter.value);
            
            switch (priceFilter.type) {
                case 'eq':
                    matchesPrice = amount === filterValue;
                    break;
                case 'lt':
                    matchesPrice = amount < filterValue;
                    break;
                case 'lte':
                    matchesPrice = amount <= filterValue;
                    break;
                case 'gt':
                    matchesPrice = amount > filterValue;
                    break;
                case 'gte':
                    matchesPrice = amount >= filterValue;
                    break;
                default:
                    matchesPrice = true;
            }
        }

        // Status filter
        const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;

        return matchesSearch && matchesStatus && matchesPrice;
    });

    const handleCreateQuote = (newQuote) => {
        setQuotes(prev => [...prev, newQuote]);
    };

    const handleUpdateQuote = (updatedQuote) => {
        setQuotes(prev => prev.map(q => 
            q.id === updatedQuote.id ? updatedQuote : q
        ));
    };

    const handleDeleteQuote = (quoteId) => {
        setQuotes(prev => prev.filter(q => q.id !== quoteId));
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
                                Filter
                            </button>
                            {(searchTerm || filterStatus !== 'all' || priceFilter.type !== 'none') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterStatus('all');
                                        setFilterType('all');
                                        setPriceFilter({ type: 'none', value: '' });
                                    }}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="flex flex-wrap gap-4 pt-4 border-t">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            >
                                <option value="all">Search All</option>
                                <option value="name">Quote Name</option>
                                <option value="customer">Customer</option>
                                <option value="items">Items</option>
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            >
                                <option value="all">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Declined">Declined</option>
                            </select>
                            
                            {/* Add price filter controls */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={priceFilter.type}
                                    onChange={(e) => setPriceFilter(prev => ({ ...prev, type: e.target.value }))}
                                    className="px-3 py-2 border rounded-lg"
                                >
                                    <option value="none">No Price Filter</option>
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
                                        placeholder="Enter amount"
                                        className="px-3 py-2 border rounded-lg w-32"
                                        min="0"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <div className="space-y-4">
                {filteredQuotes.map((quote) => (
                    <Card key={quote.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">
                                        <HighlightedText 
                                            text={quote.id} 
                                            highlight={filterType === 'name' || filterType === 'all' ? searchTerm : ''} 
                                        />
                                    </h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        quote.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                        quote.status === 'Declined' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {quote.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <User size={16} className="mr-2" />
                                        <HighlightedText 
                                            text={quote.customer} 
                                            highlight={filterType === 'customer' || filterType === 'all' ? searchTerm : ''} 
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <DollarSign size={16} className="mr-2" />
                                        ${quote.amount.toLocaleString()}
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
                                        <th className="text-right font-medium">Quantity</th>
                                        <th className="text-right font-medium">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quote.items.map((item, index) => (
                                        <tr key={index} className="text-sm">
                                            <td className="py-2">
                                                <HighlightedText 
                                                    text={item.name} 
                                                    highlight={filterType === 'items' || filterType === 'all' ? searchTerm : ''} 
                                                />
                                            </td>
                                            <td className="text-right">{item.quantity}</td>
                                            <td className="text-right">${item.price.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ))}
            </div>

            <QuoteFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedQuote(null);
                }}
                onSubmit={(quote) => {
                    if (selectedQuote) {
                        handleUpdateQuote(quote);
                    } else {
                        handleCreateQuote(quote);
                    }
                }}
                quote={selectedQuote}
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
                    handleDeleteQuote(deleteQuote.id);
                    setShowDeleteConfirm(false);
                    setDeleteQuote(null);
                }}
            />
        </div>
    );
};

export default Quotes; 