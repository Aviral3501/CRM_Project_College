import  Card  from '../../components/ui/Card';
import {  LineChart, DollarSign, Users, Briefcase, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    ComposedChart, ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Cell, Line ,ResponsiveContainer, PieChart, Pie,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    RadialBarChart, RadialBar,
    AreaChart, Area
} from 'recharts';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useUser } from "../../context/UserContext";


const Analytics = () => {
    const [salesData, setSalesData] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { userData, BASE_URL } = useUser();
    const [projectData, setProjectData] = useState(null);

        // Add this new useEffect for fetching project data
        useEffect(() => {
            const fetchProjectAnalytics = async () => {
                try {
                    setIsLoading(true);
                    const response = await axios.post(`${BASE_URL}/analytics/projects`, {
                        organization_id: userData.organization_id,
                        user_id: userData.user_id
                    });
    
                    if (response.data.success) {
                        console.log('Project Analytics Data:', response.data.data);
                        setProjectData(response.data.data);
                    } else {
                        toast.error('Failed to fetch project analytics');
                    }
                } catch (error) {
                    console.error('Error fetching project analytics:', error);
                    toast.error('Error loading project analytics');
                } finally {
                    setIsLoading(false);
                }
            };
    
            if (userData?.organization_id && userData?.user_id) {
                fetchProjectAnalytics();
            }
        }, [userData?.organization_id, userData?.user_id, BASE_URL]);

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

    // Calculate percentage change
    const calculateChange = (current, total) => {
        if (!total) return '0%';
        const percentage = (current / total * 100).toFixed(1);
        return `${percentage}%`;
    };

    // Dynamic stats based on real data
    const getStats = () => {
        if (!dashboardData || !salesData) return [];

        return [
            {
                title: 'Total Pipeline Value',
                value: formatCurrency(dashboardData.totalValues.pipeline || 0),
                change: calculateChange(
                    dashboardData.statusDistribution.pipeline.find(s => s._id === 'Closed Won')?.count || 0,
                    dashboardData.counts.pipeline
                ),
            icon: <DollarSign className="text-green-500" size={24} />
        },
        {
            title: 'Active Projects',
                value: dashboardData.statusDistribution.projects.find(s => s._id === 'In Progress')?.count || 0,
                change: `${dashboardData.counts.projects} Total`,
            icon: <Briefcase className="text-blue-500" size={24} />
        },
        {
                title: 'Lead Conversion',
                value: `${((dashboardData.statusDistribution.leads.find(s => s._id === 'Converted')?.count || 0) / 
                    dashboardData.counts.leads * 100).toFixed(1)}%`,
                change: `${dashboardData.counts.leads} Total Leads`,
            icon: <Users className="text-purple-500" size={24} />
        },
        {
                title: 'Task Completion',
                value: `${((dashboardData.statusDistribution.tasks.find(s => s._id === 'Completed')?.count || 0) / 
                    dashboardData.counts.tasks * 100).toFixed(1)}%`,
                change: `${dashboardData.counts.tasks} Total Tasks`,
            icon: <TrendingUp className="text-orange-500" size={24} />
        }
    ];
    };

    // Dynamic recent activities based on real data
    const getRecentActivities = () => {
        if (!dashboardData) return [];

        const activities = [];

        // Add recent leads
        dashboardData.recentActivity.leads.slice(0, 2).forEach(lead => {
            activities.push({
                type: 'Lead',
                message: `New lead: ${lead.name} (${lead.status})`,
                time: new Date(lead.createdAt).toLocaleDateString()
            });
        });

        // Add recent quotes
        dashboardData.recentActivity.quotes.slice(0, 2).forEach(quote => {
            activities.push({
                type: 'Quote',
                message: `Quote created: ${quote.title} (${formatCurrency(quote.amount)})`,
                time: new Date(quote.createdAt).toLocaleDateString()
            });
        });

        // Add recent pipeline updates
        dashboardData.recentActivity.pipeline.slice(0, 2).forEach(pipeline => {
            activities.push({
                type: 'Pipeline',
                message: `Deal update: ${pipeline.title} moved to ${pipeline.stage}`,
                time: new Date(pipeline.createdAt).toLocaleDateString()
            });
        });

        return activities;
    };

    // Get performance metrics based on real data
    const getPerformanceMetrics = () => {
        if (!dashboardData) return [];

        return [
            {
                label: 'Project Success Rate',
                value: ((dashboardData.statusDistribution.projects.find(s => s._id === 'Completed')?.count || 0) / 
                    dashboardData.counts.projects * 100).toFixed(1),
                color: 'green'
            },
            {
                label: 'Quote Success Rate',
                value: ((dashboardData.statusDistribution.quotes.find(s => s._id === 'Accepted')?.count || 0) / 
                    dashboardData.counts.quotes * 100).toFixed(1),
                color: 'blue'
            },
            {
                label: 'Pipeline Win Rate',
                value: ((dashboardData.statusDistribution.pipeline.find(s => s._id === 'Closed Won')?.count || 0) / 
                    dashboardData.counts.pipeline * 100).toFixed(1),
                color: 'purple'
            }
        ];
    };

    // Fetch sales analytics data
    useEffect(() => {
        const fetchSalesAnalytics = async () => {
            try {
                setIsLoading(true);
                const response = await axios.post(`${BASE_URL}/analytics/sales`, {
                    organization_id: userData.organization_id,
                    user_id: userData.user_id
                });

                if (response.data.success) {
                    console.log('Sales Analytics Data:', response.data.data);
                    setSalesData(response.data.data);
                } else {
                    toast.error('Failed to fetch sales analytics');
                }
            } catch (error) {
                console.error('Error fetching sales analytics:', error);
                toast.error('Error loading sales analytics');
            } finally {
                setIsLoading(false);
            }
        };

        if (userData.organization_id && userData.user_id) {
            fetchSalesAnalytics();
        }
    }, [userData.organization_id, userData.user_id, BASE_URL]);

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
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {!isLoading && dashboardData && getStats().map((stat, index) => (
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

            {/* Sales Analytics Section */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : salesData ? (
                <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6">Sales Analytics</h2>
                    <SalesAnalytics salesData={salesData} />
                </div>
            ) : null}

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : projectData ? (
                <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6">Project Analytics</h2>
                    <ProjectAnalytics projectData={projectData} />
                </div>
            ) : null}




          


        </div>
    );
};

export default Analytics;



const SalesAnalytics = ({ salesData }) => {
    const [selectedView, setSelectedView] = useState('overview');
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [selectedTimeRange, setSelectedTimeRange] = useState('month');
    const [selectedClient, setSelectedClient] = useState('all');
    const [filteredData, setFilteredData] = useState(salesData);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

    // Extract unique employees and clients
    const employees = [...new Set(salesData.pipelineStages.flatMap(stage => 
        stage.deals.map(deal => deal.assignedTo.name)
    ))];
    
    const clients = [...new Set(salesData.pipelineStages.flatMap(stage => 
        stage.deals.map(deal => deal.client.company)
    ))];

    // Filter data based on selections
    useEffect(() => {
        let filtered = { ...salesData };

        // Filter pipeline stages
        if (selectedEmployee !== 'all' || selectedClient !== 'all') {
            filtered.pipelineStages = salesData.pipelineStages.map(stage => {
                const filteredDeals = stage.deals.filter(deal => {
                    const employeeMatch = selectedEmployee === 'all' || deal.assignedTo.name === selectedEmployee;
                    const clientMatch = selectedClient === 'all' || deal.client.company === selectedClient;
                    return employeeMatch && clientMatch;
                });

                return {
                    ...stage,
                    deals: filteredDeals,
                    count: filteredDeals.length,
                    total: filteredDeals.reduce((sum, deal) => sum + deal.amount, 0),
                    avgDealSize: filteredDeals.length ? 
                        filteredDeals.reduce((sum, deal) => sum + deal.amount, 0) / filteredDeals.length : 0
                };
            });
        }

        // Filter quotes
        if (selectedEmployee !== 'all' || selectedClient !== 'all') {
            filtered.quoteValueByStatus = salesData.quoteValueByStatus.map(status => {
                const filteredQuotes = status.quotes.filter(quote => {
                    const employeeMatch = selectedEmployee === 'all' || quote.createdBy.name === selectedEmployee;
                    const clientMatch = selectedClient === 'all' || quote.client.company === selectedClient;
                    return employeeMatch && clientMatch;
                });

                return {
                    ...status,
                    quotes: filteredQuotes,
                    count: filteredQuotes.length,
                    total: filteredQuotes.reduce((sum, quote) => sum + quote.amount, 0),
                    avgQuoteValue: filteredQuotes.length ? 
                        filteredQuotes.reduce((sum, quote) => sum + quote.amount, 0) / filteredQuotes.length : 0
                };
            });
        }

        // Filter monthly data based on time range
        if (selectedTimeRange !== 'month') {
            const now = new Date();
            const monthsToInclude = 
                selectedTimeRange === 'week' ? 1 :
                selectedTimeRange === 'quarter' ? 3 :
                selectedTimeRange === 'year' ? 12 : 1;

            filtered.salesByMonth = {
                quotes: filtered.salesByMonth.quotes.filter(month => {
                    const monthDate = new Date(month._id.year, month._id.month - 1);
                    const diffMonths = (now.getFullYear() - monthDate.getFullYear()) * 12 + 
                        (now.getMonth() - monthDate.getMonth());
                    return diffMonths < monthsToInclude;
                }),
                deals: filtered.salesByMonth.deals.filter(month => {
                    const monthDate = new Date(month._id.year, month._id.month - 1);
                    const diffMonths = (now.getFullYear() - monthDate.getFullYear()) * 12 + 
                        (now.getMonth() - monthDate.getMonth());
                    return diffMonths < monthsToInclude;
                })
            };
        }

        setFilteredData(filtered);
    }, [selectedEmployee, selectedClient, selectedTimeRange, salesData]);

    // Format currency for tooltips and labels
    const formatCurrency = (value) => {
        if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value}`;
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border">
                    <p className="font-semibold">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value >= 1000 ? formatCurrency(entry.value) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <div className="bg-white p-4 rounded-xl shadow-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">View</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={selectedView}
                            onChange={(e) => setSelectedView(e.target.value)}
                        >
                            <option value="overview">Overview</option>
                            <option value="pipeline">Pipeline Analysis</option>
                            <option value="deals">Deal Analytics</option>
                            <option value="quotes">Quote Insights</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Employee</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                            <option value="all">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp} value={emp}>{emp}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Time Range</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                        >
                            <option value="all">All Clients</option>
                            {clients.map(client => (
                                <option key={client} value={client}>{client}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Sales Funnel & Conversion */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
            >
                    <h3 className="text-xl font-bold mb-6">Sales Funnel & Conversion</h3>
                    <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                            <ComposedChart
                                data={filteredData.pipelineStages}
                                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Number of Deals" />
                                <Line yAxisId="right" type="monotone" dataKey="total" stroke="#82ca9d" name="Total Value" />
                            </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

                {/* Chart 2: Pipeline Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-lg"
            >
                    <h3 className="text-xl font-bold mb-6">Pipeline Distribution</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={filteredData.pipelineStages}
                                    dataKey="total"
                                    nameKey="_id"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={150}
                                    fill="#8884d8"
                                    label
                                >
                                    {filteredData.pipelineStages.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        </div>
                </motion.div>

                {/* Chart 3: Monthly Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <h3 className="text-xl font-bold mb-6">Monthly Performance</h3>
                    <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <AreaChart
                                data={filteredData.salesByMonth.deals}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id.month" />
                            <YAxis />
                            <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" name="Total Value" />
                                <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" name="Deal Count" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

                {/* Chart 4: Quote Analysis */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-lg"
            >
                    <h3 className="text-xl font-bold mb-6">Quote Analysis</h3>
                    <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                                data={filteredData.quoteValueByStatus}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                            <Legend />
                                <Bar dataKey="total" fill="#8884d8" name="Total Value" />
                                <Bar dataKey="count" fill="#82ca9d" name="Number of Quotes" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-xl shadow-lg"
                >
                    <h4 className="text-lg font-semibold">Total Pipeline Value</h4>
                    <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(filteredData.pipelineStages.reduce((acc, stage) => acc + stage.total, 0))}
                    </p>
                    <p className="text-sm text-gray-500">
                        Across {filteredData.pipelineStages.reduce((acc, stage) => acc + stage.count, 0)} deals
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-xl shadow-lg"
                >
                    <h4 className="text-lg font-semibold">Average Deal Size</h4>
                    <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(filteredData.pipelineStages.reduce((acc, stage) => acc + stage.avgDealSize, 0))}
                    </p>
                    <p className="text-sm text-gray-500">Per closed deal</p>
                </motion.div>

            <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-xl shadow-lg"
                >
                    <h4 className="text-lg font-semibold">Win Rate</h4>
                    <p className="text-3xl font-bold text-purple-600">
                        {((filteredData.pipelineStages.find(stage => stage._id === 'Closed Won')?.count || 0) / 
                        filteredData.pipelineStages.reduce((acc, stage) => acc + stage.count, 0) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">Overall conversion</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-xl shadow-lg"
                >
                    <h4 className="text-lg font-semibold">Active Quotes</h4>
                    <p className="text-3xl font-bold text-orange-600">
                        {filteredData.quoteValueByStatus[0].count}
                    </p>
                    <p className="text-sm text-gray-500">Total value: {formatCurrency(filteredData.quoteValueByStatus[0].total)}</p>
            </motion.div>
            </div>
        </div>
    );
};

const ProjectAnalytics = ({ projectData }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border">
                    <p className="font-semibold">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}${entry.name.includes('Rate') ? '%' : ''}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Chart 1: Project Progress Matrix
    const ProjectProgressMatrix = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg"
        >
            <h3 className="text-xl font-bold mb-6">Project Progress Matrix</h3>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis 
                            type="number" 
                            dataKey="progress" 
                            name="Progress" 
                            unit="%" 
                        />
                        <YAxis 
                            type="number" 
                            dataKey="taskAnalytics.total" 
                            name="Total Tasks" 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {projectData.projectDetails.map((project, index) => (
                            <Scatter 
                                key={project._id}
                                name={project.name}
                                data={[{
                                    progress: project.progress,
                                    'taskAnalytics.total': project.taskAnalytics.total,
                                    status: project.status,
                                    priority: project.priority
                                }]}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );

    // Chart 2: Task Distribution Analysis
    const TaskDistributionAnalysis = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg"
        >
            <h3 className="text-xl font-bold mb-6">Task Distribution Analysis</h3>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <RadarChart outerRadius={150}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="_id" />
                        <PolarRadiusAxis />
                        <Radar
                            name="Status"
                            dataKey="count"
                            data={projectData.taskMetrics.statusDistribution}
                            fill="#8884d8"
                            fillOpacity={0.6}
                        />
                        <Radar
                            name="Priority"
                            dataKey="count"
                            data={projectData.taskMetrics.priorityDistribution}
                            fill="#82ca9d"
                            fillOpacity={0.6}
                        />
                        <Legend />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );

    // Chart 3: Project Timeline Performance
    const ProjectTimelinePerformance = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg"
        >
            <h3 className="text-xl font-bold mb-6">Project Timeline Performance</h3>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <ComposedChart
                        data={projectData.timelineMetrics.projectsByMonth}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid stroke="#f5f5f5" />
                        <XAxis 
                            dataKey="_id.month" 
                            label={{ value: 'Month', position: 'bottom' }} 
                        />
                        <YAxis yAxisId="left" label={{ value: 'Count', angle: -90, position: 'left' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Progress %', angle: 90, position: 'right' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Total Projects" />
                        <Bar yAxisId="left" dataKey="completed" fill="#82ca9d" name="Completed" />
                        <Line yAxisId="right" type="monotone" dataKey="averageProgress" stroke="#ff7300" name="Avg Progress" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );

    // Chart 4: Resource Workload Distribution
    const ResourceWorkloadDistribution = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg"
        >
            <h3 className="text-xl font-bold mb-6">Resource Workload Distribution</h3>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <RadialBarChart 
                        innerRadius="10%" 
                        outerRadius="80%" 
                        data={[
                            {
                                name: 'Not Started',
                                value: projectData.resourceMetrics[0].workload.byStatus.notStarted,
                                fill: '#0088FE'
                            },
                            {
                                name: 'In Progress',
                                value: projectData.resourceMetrics[0].workload.byStatus.inProgress,
                                fill: '#00C49F'
                            },
                            {
                                name: 'Completed',
                                value: projectData.resourceMetrics[0].workload.byStatus.completed,
                                fill: '#FFBB28'
                            }
                        ]}
                    >
                        <RadialBar 
                            minAngle={15} 
                            label={{ position: 'insideStart', fill: '#fff' }} 
                            background
                            dataKey="value"
                        />
                        <Legend 
                            iconSize={10} 
                            layout="vertical" 
                            verticalAlign="middle" 
                            align="right"
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            {/* Project Analytics Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-xl shadow-lg"
                >
                    <h4 className="text-lg font-semibold">Overall Progress</h4>
                    <p className="text-3xl font-bold text-blue-600">
                        {(projectData.projectDetails.reduce((acc, proj) => acc + proj.progress, 0) / 
                        projectData.projectDetails.length).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">Average across all projects</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-xl shadow-lg"
                >
                    <h4 className="text-lg font-semibold">Task Completion</h4>
                    <p className="text-3xl font-bold text-green-600">
                        {projectData.resourceMetrics[0].performance.completionRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">Overall completion rate</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-xl shadow-lg"
                >
                    <h4 className="text-lg font-semibold">On-Time Performance</h4>
                    <p className="text-3xl font-bold text-purple-600">
                        {projectData.resourceMetrics[0].performance.onTimeCompletion.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">Tasks completed on time</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-xl shadow-lg"
                >
                    <h4 className="text-lg font-semibold">Total Projects</h4>
                    <p className="text-3xl font-bold text-orange-600">
                        {projectData.projectDetails.length}
                    </p>
                    <p className="text-sm text-gray-500">Active projects</p>
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProjectProgressMatrix />
                <TaskDistributionAnalysis />
                <ProjectTimelinePerformance />
                <ResourceWorkloadDistribution />
            </div>
        </div>
    );
};