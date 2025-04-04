import { useState } from 'react';
import  Card  from '../../components/ui/Card';
import { Bell, MessageSquare, AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react';

const Notifications = () => {
    const [notifications] = useState([
        {
            id: 1,
            type: 'task',
            title: 'New Task Assigned',
            message: 'You have been assigned to the Website Redesign project',
            time: '10 minutes ago',
            read: false,
            priority: 'high'
        },
        {
            id: 2,
            type: 'message',
            title: 'New Message',
            message: 'John Doe commented on your task',
            time: '1 hour ago',
            read: false,
            priority: 'medium'
        },
        {
            id: 3,
            type: 'alert',
            title: 'Project Deadline',
            message: 'Mobile App project deadline is approaching',
            time: '2 hours ago',
            read: true,
            priority: 'high'
        },
        {
            id: 4,
            type: 'update',
            title: 'System Update',
            message: 'System maintenance scheduled for tonight',
            time: '1 day ago',
            read: true,
            priority: 'low'
        }
    ]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                <button className="text-sm text-green-500 hover:text-green-600">
                    Mark all as read
                </button>
            </div>

            <Card className="divide-y">
                {notifications.map((notification) => (
                    <div 
                        key={notification.id} 
                        className={`p-4 flex items-start gap-4 ${
                            !notification.read ? 'bg-gray-50' : ''
                        }`}
                    >
                        <div className={`p-2 rounded-full ${
                            notification.type === 'task' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'message' ? 'bg-green-100 text-green-600' :
                            notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                            {notification.type === 'task' && <CheckCircle size={20} />}
                            {notification.type === 'message' && <MessageSquare size={20} />}
                            {notification.type === 'alert' && <AlertCircle size={20} />}
                            {notification.type === 'update' && <Clock size={20} />}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium">{notification.title}</h3>
                                    <p className="text-sm text-gray-600">{notification.message}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {notification.priority}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                <Calendar size={14} />
                                {notification.time}
                            </div>
                        </div>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default Notifications; 