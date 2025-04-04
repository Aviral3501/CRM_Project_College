import { useState } from 'react';
import  Card  from '../../components/ui/Card';
import { Plus, Search, Mail, Phone, MapPin, Building, BarChart2 } from 'lucide-react';

const Employees = () => {
    const [employees] = useState([
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Employees</h1>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
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
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Employees; 