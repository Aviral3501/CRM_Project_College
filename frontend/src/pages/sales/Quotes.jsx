import { useState } from 'react';
import  Card  from '../../components/ui/Card';
import { Plus, Search, Filter, Download, Eye, DollarSign, Calendar, User } from 'lucide-react';

const Quotes = () => {
    const [quotes] = useState([
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quotes</h1>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20} />
                    Create Quote
                </button>
            </div>

            <Card className="mb-6">
                <div className="p-4 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search quotes..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
                        <Filter size={20} />
                        Filter
                    </button>
                </div>
            </Card>

            <div className="space-y-4">
                {quotes.map((quote) => (
                    <Card key={quote.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">{quote.id}</h3>
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
                                        {quote.customer}
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
                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                    <Eye size={20} />
                                </button>
                                <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                                    <Download size={20} />
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
                                            <td className="py-2">{item.name}</td>
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
        </div>
    );
};

export default Quotes; 