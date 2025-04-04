import  Card  from '../../components/ui/Card';
import { BarChart, LineChart, DollarSign, Users, Briefcase, TrendingUp } from 'lucide-react';

const Analytics = () => {
    const stats = [
        {
            title: 'Total Revenue',
            value: '$156,789',
            change: '+12.5%',
            icon: <DollarSign className="text-green-500" size={24} />
        },
        {
            title: 'Active Projects',
            value: '24',
            change: '+3',
            icon: <Briefcase className="text-blue-500" size={24} />
        },
        {
            title: 'Team Members',
            value: '12',
            change: '+2',
            icon: <Users className="text-purple-500" size={24} />
        },
        {
            title: 'Completion Rate',
            value: '94%',
            change: '+5%',
            icon: <TrendingUp className="text-orange-500" size={24} />
        }
    ];

    const recentActivities = [
        { type: 'Project', message: 'Website Redesign completed', time: '2 hours ago' },
        { type: 'Sales', message: 'New deal worth $25,000 closed', time: '4 hours ago' },
        { type: 'Team', message: 'New team member added', time: '1 day ago' },
        { type: 'Task', message: '15 tasks completed this week', time: '2 days ago' }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">{stat.title}</h3>
                            {stat.icon}
                        </div>
                        <div className="flex items-baseline">
                            <p className="text-2xl font-semibold">{stat.value}</p>
                            <span className="ml-2 text-sm text-green-500">{stat.change}</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
                    <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">{activity.message}</p>
                                    <span className="text-xs text-gray-400">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Project Completion Rate</span>
                                <span className="font-medium">85%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Customer Satisfaction</span>
                                <span className="font-medium">92%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Team Productivity</span>
                                <span className="font-medium">78%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Analytics; 