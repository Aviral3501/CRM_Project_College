import { useEffect, useState } from "react";
import Card  from "../components/ui/Card"
import {  DollarSign, Users, Briefcase } from 'lucide-react';
import {  LineChart, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
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

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { userData, BASE_URL } = useUser();
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

            // Fetch dashboard analytics data
            useEffect(() => {
                const fetchDashboardAnalytics = async () => {
                    try {
                        setIsLoading(true);
                        const response = await axios.post(`${BASE_URL}/analytics/dashboard`, {
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