import { useState } from 'react';
import Card  from '../../components/ui/Card';
import { Plus, Search, Filter, Mail, Phone, Building, MapPin, MoreVertical } from 'lucide-react';

const Customers = () => {
    const [customers] = useState([
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Customers</h1>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
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
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical size={20} />
                            </button>
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
        </div>
    );
};

export default Customers; 