import { useEffect, useState } from "react";
import Card  from "../components/ui/Card"
import {  DollarSign, Users, Briefcase, CheckCircle } from 'lucide-react';
import {  LineChart, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ComposedChart, ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Cell, Line ,ResponsiveContainer, PieChart, Pie,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    RadialBarChart, RadialBar,
    AreaChart, Area
} from 'recharts';
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";
import axios from "axios";
import axiosInstance from "../api/axios";

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { userData, BASE_URL } = useUser();
    const navigate = useNavigate();
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

    const quickActions = [
        {
            title: "Create New Lead",
            path: "/sales/leads",
            icon: "➕👥",
            bgColor: "bg-blue-50",
            hoverColor: "hover:bg-blue-100"
        },
        {
            title: "Add New Customer",
            path: "/sales/customers",
            icon: "➕👤",
            bgColor: "bg-green-50",
            hoverColor: "hover:bg-green-100"
        },
        {
            title: "Create New Quote",
            path: "/sales/quotes",
            icon: "➕📄",
            bgColor: "bg-purple-50",
            hoverColor: "hover:bg-purple-100"
        },
        {
            title: "Add New Project",
            path: "/projects",
            icon: "➕📊",
            bgColor: "bg-orange-50",
            hoverColor: "hover:bg-orange-100"
        },
        {
            title: "Assign New Task",
            path: "/tasks",
            icon: "➕✓",
            bgColor: "bg-yellow-50",
            hoverColor: "hover:bg-yellow-100"
        },
        {
            title: "View Analytics",
            path: "/analytics",
            icon: "📈",
            bgColor: "bg-indigo-50",
            hoverColor: "hover:bg-indigo-100"
        }
    ];

    // Fetch dashboard analytics data
    useEffect(() => {
        const fetchDashboardAnalytics = async () => {
            try {
                setIsLoading(true);
                const response = await axiosInstance.post(`${BASE_URL}/analytics/dashboard`, {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });
    
                if (response.data.success) {
                    setDashboardData(response.data.data);
                } else {
                    toast.error('Failed to fetch dashboard analytics');
                }
            } catch (error) {
                console.error('Error fetching dashboard analytics:', error);
                toast.error('Error loading dashboard analytics');
            } finally {
                setIsLoading(false);
            }
        };
    
        if (userData.organization_id && userData.user_id) {
            fetchDashboardAnalytics();
        }
    }, [userData.organization_id, userData.user_id, BASE_URL]);

    // Format currency values
    const formatCurrency = (value) => {
        if (value >= 1000000000) {
            return `$${(value / 1000000000).toFixed(1)}B`;
        } else if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`;
        }
        return `$${value}`;
    };

    // Calculate conversion rate
    const calculateConversionRate = () => {
        if (!dashboardData) return 0;
        const converted = dashboardData.statusDistribution.leads.find(s => s._id === 'Converted')?.count || 0;
        const total = dashboardData.counts.leads;
        return total ? ((converted / total) * 100).toFixed(1) : 0;
    };

    // Get win rate from pipeline
    const calculateWinRate = () => {
        if (!dashboardData) return 0;
        const won = dashboardData.statusDistribution.pipeline.find(s => s._id === 'Closed Won')?.count || 0;
        const total = dashboardData.counts.pipeline;
        return total ? ((won / total) * 100).toFixed(1) : 0;
    };

    const dashboardCards = [
        {
            title: "Total Pipeline Value",
            value: dashboardData ? formatCurrency(dashboardData.totalValues.pipeline) : '$0',
            change: `${calculateWinRate()}% Win Rate`,
            icon: <DollarSign className="text-green-500" size={24} />,
            onClick: () => navigate('/sales/pipeline'),
            bgColor: "bg-green-50",
            textColor: "text-green-600"
        },
        {
            title: "Active Projects",
            value: dashboardData?.counts.projects || 0,
            change: `${dashboardData?.statusDistribution.projects.find(s => s._id === 'In Progress')?.count || 0} In Progress`,
            icon: <Briefcase className="text-blue-500" size={24} />,
            onClick: () => navigate('/projects'),
            bgColor: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            title: "Lead Conversion",
            value: `${calculateConversionRate()}%`,
            change: `${dashboardData?.counts.leads || 0} Total Leads`,
            icon: <Users className="text-purple-500" size={24} />,
            onClick: () => navigate('/sales/leads'),
            bgColor: "bg-purple-50",
            textColor: "text-purple-600"
        },
        {
            title: "Task Completion",
            value: dashboardData ? `${((dashboardData.statusDistribution.tasks.find(s => s._id === 'Completed')?.count || 0) / 
                                    dashboardData.counts.tasks * 100).toFixed(1)}%` : '0%',
            change: `${dashboardData?.counts.tasks || 0} Total Tasks`,
            icon: <CheckCircle className="text-orange-500" size={24} />,
            onClick: () => navigate('/tasks'),
            bgColor: "bg-orange-50",
            textColor: "text-orange-600"
        }
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {dashboardCards.map((card, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className={`${card.bgColor} p-6 rounded-xl shadow-lg cursor-pointer`}
                        onClick={card.onClick}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-700 font-medium">{card.title}</h3>
                            {card.icon}
                        </div>
                        <div className="flex flex-col">
                            <p className={`text-2xl font-bold ${card.textColor}`}>
                                {card.value}
                            </p>
                            <span className="mt-2 text-sm text-gray-600">
                                {card.change}
                            </span>
                        </div>
                        <div className={`h-1 w-full bg-${card.textColor} bg-opacity-20 rounded-full mt-4`}>
                            <div 
                                className={`h-1 ${card.textColor} rounded-full`}
                                style={{ 
                                    width: card.value.toString().includes('%') ? 
                                        card.value : '100%' 
                                }}
                            ></div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(action.path)}
                                className={`w-full text-left p-4 rounded ${action.bgColor} ${action.hoverColor} 
                                          transition-all duration-300 flex items-center space-x-3 group`}
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                                    {action.icon}
                                </span>
                                <span className="font-medium">{action.title}</span>
                            </button>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Performance Highlights</h2>
                    <div className="space-y-4">
                        {/* Lead Conversion Highlight */}
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Users className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Lead Conversion</p>
                                    <p className="text-xs text-gray-600">
                                        {dashboardData?.statusDistribution.leads.find(s => s._id === 'Converted')?.count || 0} converted leads
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-600">{calculateConversionRate()}%</p>
                                <p className="text-xs text-gray-600">conversion rate</p>
                            </div>
                        </div>

                        {/* Pipeline Value Highlight */}
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <DollarSign className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Pipeline Value</p>
                                    <p className="text-xs text-gray-600">
                                        {dashboardData?.counts.pipeline || 0} opportunities
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">{formatCurrency(dashboardData?.totalValues.pipeline || 0)}</p>
                                <p className="text-xs text-gray-600">total value</p>
                            </div>
                        </div>

                        {/* Task Progress Highlight */}
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <CheckCircle className="text-purple-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Task Progress</p>
                                    <p className="text-xs text-gray-600">
                                        {dashboardData?.statusDistribution.tasks.find(s => s._id === 'Completed')?.count || 0} of {dashboardData?.counts.tasks || 0} completed
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-purple-600">
                                    {dashboardData ? 
                                        `${((dashboardData.statusDistribution.tasks.find(s => s._id === 'Completed')?.count || 0) / 
                                        dashboardData.counts.tasks * 100).toFixed(1)}%` : '0%'}
                                </p>
                                <p className="text-xs text-gray-600">completion rate</p>
                            </div>
                        </div>

                        {/* Quote Success Highlight */}
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <TrendingUp className="text-orange-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Quote Value</p>
                                    <p className="text-xs text-gray-600">
                                        {dashboardData?.counts.quotes || 0} total quotes
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-orange-600">{formatCurrency(dashboardData?.totalValues.quotes || 0)}</p>
                                <p className="text-xs text-gray-600">total value</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

             {/* Dashboard Analytics Section */}
             {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : dashboardData ? (
                <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6">Dashboard Analytics</h2>
                    <DashboardAnalytics dashboardData={dashboardData} />
                </div>
            ) : null}


        </div>
    );
};

export default Dashboard; 


const DashboardAnalytics = ({ dashboardData }) => {
    const [selectedMetric, setSelectedMetric] = useState('all');
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

    // Format currency values
    const formatCurrency = (value) => {
        if (value >= 1000000000) {
            return `$${(value / 1000000000).toFixed(1)}B`;
        } else if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`;
        }
        return `$${value}`;
    };

    return (
        <div className="space-y-8">
            {/* Metric Selector */}
            <div className="bg-white p-4 rounded-xl shadow-lg">
                <select
                    className="w-full p-2 border rounded"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                >
                    <option value="all">All Metrics</option>
                    <option value="leads">Leads</option>
                    <option value="pipeline">Pipeline</option>
                    <option value="quotes">Quotes</option>
                    <option value="tasks">Tasks</option>
                </select>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Business Health Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-xl font-bold mb-6">Business Health Overview</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <RadarChart outerRadius={150} data={[
                                {
                                    metric: 'Leads',
                                    value: dashboardData.counts.leads,
                                    fullMark: 10
                                },
                                {
                                    metric: 'Customers',
                                    value: dashboardData.counts.customers,
                                    fullMark: 10
                                },
                                {
                                    metric: 'Quotes',
                                    value: dashboardData.counts.quotes,
                                    fullMark: 10
                                },
                                {
                                    metric: 'Pipeline',
                                    value: dashboardData.counts.pipeline,
                                    fullMark: 10
                                },
                                {
                                    metric: 'Projects',
                                    value: dashboardData.counts.projects,
                                    fullMark: 10
                                }
                            ]}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="metric" />
                                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                                <Radar name="Current" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Tooltip />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Chart 2: Pipeline Stage Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-xl font-bold mb-6">Pipeline Stage Analysis</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <ComposedChart
                                data={dashboardData.statusDistribution.pipeline}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip content={({ payload, label }) => (
                                    <div className="bg-white p-4 shadow-lg rounded-lg border">
                                        <p className="font-bold">{label}</p>
                                        <p>Count: {payload?.[0]?.value}</p>
                                        <p>Success Rate: {((payload?.[0]?.value / dashboardData.counts.pipeline) * 100).toFixed(1)}%</p>
                                    </div>
                                )} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="count" fill="#8884d8">
                                    {dashboardData.statusDistribution.pipeline.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                                <Line yAxisId="right" type="monotone" dataKey="count" stroke="#ff7300" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Chart 3: Task Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-xl font-bold mb-6">Task Status Distribution</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={dashboardData.statusDistribution.tasks}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={150}
                                    fill="#8884d8"
                                    dataKey="count"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {dashboardData.statusDistribution.tasks.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

              {/* Chart 4: Lead-to-Pipeline Conversion Flow */}
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6 }}
    className="bg-white p-6 rounded-xl shadow-lg"
>
    <h3 className="text-xl font-bold mb-6">Lead-to-Pipeline Conversion Flow</h3>
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <ComposedChart
                data={[
                    {
                        stage: 'Total Leads',
                        count: dashboardData.counts.leads,
                        converted: dashboardData.statusDistribution.leads.find(s => s._id === 'Converted')?.count || 0,
                        rate: ((dashboardData.statusDistribution.leads.find(s => s._id === 'Converted')?.count || 0) / dashboardData.counts.leads * 100).toFixed(1)
                    },
                    {
                        stage: 'Pipeline',
                        count: dashboardData.counts.pipeline,
                        converted: dashboardData.statusDistribution.pipeline.find(s => s._id === 'Closed Won')?.count || 0,
                        rate: ((dashboardData.statusDistribution.pipeline.find(s => s._id === 'Closed Won')?.count || 0) / dashboardData.counts.pipeline * 100).toFixed(1)
                    },
                    {
                        stage: 'Quotes',
                        count: dashboardData.counts.quotes,
                        converted: dashboardData.statusDistribution.quotes.find(s => s._id === 'Accepted')?.count || 0,
                        rate: ((dashboardData.statusDistribution.quotes.find(s => s._id === 'Accepted')?.count || 0) / dashboardData.counts.quotes * 100).toFixed(1)
                    }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis yAxisId="left" orientation="left" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Conversion Rate (%)', angle: 90, position: 'insideRight' }} />
                <Tooltip content={({ payload, label }) => (
                    <div className="bg-white p-4 shadow-lg rounded-lg border">
                        <p className="font-bold">{label}</p>
                        <p>Total: {payload?.[0]?.payload.count}</p>
                        <p>Converted: {payload?.[0]?.payload.converted}</p>
                        <p>Success Rate: {payload?.[0]?.payload.rate}%</p>
                    </div>
                )} />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Total Count">
                    {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#ff7300" name="Conversion Rate" />
            </ComposedChart>
        </ResponsiveContainer>
    </div>
</motion.div>

{/* Chart 5: Project and Task Progress Matrix */}
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.8 }}
    className="bg-white p-6 rounded-xl shadow-lg col-span-2"
>
    <h3 className="text-xl font-bold mb-6">Project and Task Progress Matrix</h3>
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <RadarChart outerRadius={150} data={[
                {
                    category: 'Not Started',
                    projects: dashboardData.statusDistribution.projects.find(s => s._id === 'Not Started')?.count || 0,
                    tasks: dashboardData.statusDistribution.tasks.find(s => s._id === 'Not Started')?.count || 0,
                    completion: 0
                },
                {
                    category: 'In Progress',
                    projects: dashboardData.statusDistribution.projects.find(s => s._id === 'In Progress')?.count || 0,
                    tasks: dashboardData.statusDistribution.tasks.find(s => s._id === 'In Progress')?.count || 0,
                    completion: 50
                },
                {
                    category: 'Completed',
                    projects: dashboardData.statusDistribution.projects.find(s => s._id === 'Completed')?.count || 0,
                    tasks: dashboardData.statusDistribution.tasks.find(s => s._id === 'Completed')?.count || 0,
                    completion: 100
                },
                {
                    category: 'Pending',
                    projects: dashboardData.statusDistribution.projects.find(s => s._id === 'Pending')?.count || 0,
                    tasks: dashboardData.statusDistribution.tasks.find(s => s._id === 'Pending')?.count || 0,
                    completion: 25
                }
            ]}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="Projects" dataKey="projects" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Tasks" dataKey="tasks" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Tooltip content={({ payload, label }) => (
                    <div className="bg-white p-4 shadow-lg rounded-lg border">
                        <p className="font-bold">{label}</p>
                        <p>Projects: {payload?.[0]?.value}</p>
                        <p>Tasks: {payload?.[1]?.value}</p>
                        <p>Completion: {payload?.[0]?.payload.completion}%</p>
                    </div>
                )} />
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    </div>
</motion.div>
            </div>
        </div>
    );
};