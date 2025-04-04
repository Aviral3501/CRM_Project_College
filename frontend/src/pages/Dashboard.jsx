import Card  from "../components/ui/Card"
import { BarChart, DollarSign, Users, Briefcase } from 'lucide-react';

const Dashboard = () => {
    // Demo data
    const stats = [
        {
            title: "Total Revenue",
            value: "$124,563",
            change: "+12.5%",
            icon: <DollarSign className="text-green-500" size={24} />
        },
        {
            title: "Active Projects",
            value: "23",
            change: "+3",
            icon: <Briefcase className="text-blue-500" size={24} />
        },
        {
            title: "New Leads",
            value: "45",
            change: "+5",
            icon: <Users className="text-purple-500" size={24} />
        },
        {
            title: "Tasks Completed",
            value: "156",
            change: "+22%",
            icon: <BarChart className="text-orange-500" size={24} />
        }
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        <button className="w-full text-left p-3 rounded bg-gray-50 hover:bg-gray-100">
                            Create New Lead
                        </button>
                        <button className="w-full text-left p-3 rounded bg-gray-50 hover:bg-gray-100">
                            Add New Project
                        </button>
                        <button className="w-full text-left p-3 rounded bg-gray-50 hover:bg-gray-100">
                            Schedule Meeting
                        </button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <p className="text-sm">New lead assigned to John Doe</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <p className="text-sm">Project "Website Redesign" completed</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <p className="text-sm">Meeting scheduled with Client XYZ</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard; 