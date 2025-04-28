import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    ClipboardList, 
    UserCircle, 
    BarChart2, 
    Bell,
    DollarSign
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        {
            title: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            path: "/dashboard"
        },
        {
            title: "Sales",
            icon: <DollarSign size={20} />,
            path: "/sales/leads",
            subItems: [
                { title: "Leads", path: "/sales/leads" },
                { title: "Pipeline", path: "/sales/pipeline" },
                { title: "Customers", path: "/sales/customers" },
                { title: "Quotes", path: "/sales/quotes" }
            ]
        },
        {
            title: "Projects",
            icon: <Briefcase size={20} />,
            path: "/projects"
        },
        {
            title: "Tasks",
            icon: <ClipboardList size={20} />,
            path: "/tasks"
        },
        {
            title: "Employees",
            icon: <Users size={20} />,
            path: "/employees"
        },
        {
            title: "Analytics",
            icon: <BarChart2 size={20} />,
            path: "/analytics"
        },
        {
            title: "Notifications",
            icon: <Bell size={20} />,
            path: "/notifications"
        }
    ];

    return (
        <div className="h-screen w-64 bg-gray-900 text-white p-4 fixed left-0 top-0 z-[45]">
            <div className="flex items-center gap-2 mb-8">
                <UserCircle size={32} className="text-green-500" />
                <h1 className="text-xl font-bold">TrackSta</h1>
            </div>
            
            <nav>
                {menuItems.map((item) => (
                    <div key={item.path} className="mb-4">
                        <Link
                            to={item.path}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                location.pathname === item.path
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            {item.icon}
                            <span>{item.title}</span>
                        </Link>
                        
                        {item.subItems && (
                            <div className="ml-8 mt-2 space-y-2">
                                {item.subItems.map((subItem) => (
                                    <Link
                                        key={subItem.path}
                                        to={subItem.path}
                                        className={`block p-2 rounded-lg transition-colors ${
                                            location.pathname === subItem.path
                                                ? 'text-green-500'
                                                : 'text-gray-400 hover:text-green-400'
                                        }`}
                                    >
                                        {subItem.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar; 