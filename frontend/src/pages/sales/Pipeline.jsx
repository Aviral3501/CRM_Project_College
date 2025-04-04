import { useState } from 'react';
import Card  from '../../components/ui/Card';
import { DollarSign, Users, Calendar } from 'lucide-react';

const Pipeline = () => {
    const [stages] = useState([
        {
            title: 'Qualified Leads',
            deals: [
                { id: 1, name: 'Tech Corp Deal', value: 50000, company: 'Tech Corp', dueDate: '2024-04-15' },
                { id: 2, name: 'Design Co Project', value: 25000, company: 'Design Co', dueDate: '2024-04-20' },
            ]
        },
        {
            title: 'Meeting Scheduled',
            deals: [
                { id: 3, name: 'Software Solution', value: 75000, company: 'Software Inc', dueDate: '2024-04-18' },
            ]
        },
        {
            title: 'Proposal Sent',
            deals: [
                { id: 4, name: 'Cloud Migration', value: 100000, company: 'Cloud Corp', dueDate: '2024-04-25' },
            ]
        },
        {
            title: 'Negotiation',
            deals: [
                { id: 5, name: 'Security Suite', value: 85000, company: 'Secure Ltd', dueDate: '2024-04-30' },
            ]
        }
    ]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Sales Pipeline</h1>
            
            <div className="grid grid-cols-4 gap-4">
                {stages.map((stage, index) => (
                    <div key={index} className="min-w-[300px]">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-700">{stage.title}</h3>
                            <span className="text-sm text-gray-500">{stage.deals.length}</span>
                        </div>
                        
                        <div className="space-y-3">
                            {stage.deals.map((deal) => (
                                <Card key={deal.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                                    <h4 className="font-medium mb-2">{deal.name}</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <DollarSign size={16} className="mr-2" />
                                            ${deal.value.toLocaleString()}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Users size={16} className="mr-2" />
                                            {deal.company}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar size={16} className="mr-2" />
                                            {new Date(deal.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pipeline; 