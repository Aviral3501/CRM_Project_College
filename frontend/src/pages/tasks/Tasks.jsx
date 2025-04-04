import { useState } from 'react';
import  Card  from '../../components/ui/Card';
import { Plus, Calendar, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';

const Tasks = () => {
    const [tasks] = useState([
        {
            id: 1,
            title: 'Complete Project Proposal',
            description: 'Draft and submit project proposal for client review',
            priority: 'High',
            status: 'Pending',
            dueDate: '2024-04-10',
            assignedTo: 'John Doe',
            project: 'Website Redesign'
        },
        {
            id: 2,
            title: 'Client Meeting',
            description: 'Weekly progress meeting with client',
            priority: 'Medium',
            status: 'In Progress',
            dueDate: '2024-04-12',
            assignedTo: 'Jane Smith',
            project: 'Mobile App'
        },
        {
            id: 3,
            title: 'Code Review',
            description: 'Review and provide feedback on new features',
            priority: 'Low',
            status: 'Completed',
            dueDate: '2024-04-08',
            assignedTo: 'Mike Johnson',
            project: 'CRM Integration'
        }
    ]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20} />
                    Add Task
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Today's Tasks</h2>
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                <button className="mt-1">
                                    {task.status === 'Completed' ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                    ) : task.status === 'In Progress' ? (
                                        <Clock className="text-blue-500" size={20} />
                                    ) : (
                                        <Circle className="text-gray-400" size={20} />
                                    )}
                                </button>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">{task.title}</h3>
                                            <p className="text-sm text-gray-500">{task.description}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                        <span>Project: {task.project}</span>
                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        <span>Assigned to: {task.assignedTo}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
                    <div className="space-y-2">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg">
                                <Calendar size={16} className="text-gray-400" />
                                <span className="flex-1">{task.title}</span>
                                <span className="text-sm text-gray-500">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Tasks; 