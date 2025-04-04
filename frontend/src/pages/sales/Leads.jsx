import { useState } from 'react';
import Card  from '../../components/ui/Card';
import { Plus, Search, Filter } from 'lucide-react';

const Leads = () => {
    const [leads] = useState([
        { 
            id: 1, 
            name: 'John Doe', 
            company: 'Tech Corp', 
            status: 'New', 
            email: 'john@techcorp.com',
            phone: '+1 234-567-8900',
            source: 'Website'
        },
        { 
            id: 2, 
            name: 'Jane Smith', 
            company: 'Design Co', 
            status: 'Contacted', 
            email: 'jane@designco.com',
            phone: '+1 234-567-8901',
            source: 'Referral'
        },
        // Add more demo leads
    ]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Leads</h1>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20} />
                    Add Lead
                </button>
            </div>

            <Card className="mb-6">
                <div className="p-4 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
                        <Filter size={20} />
                        Filter
                    </button>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{lead.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{lead.company}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            lead.status === 'New' ? 'bg-green-100 text-green-800' :
                                            lead.status === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{lead.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{lead.source}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Leads; 