import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { Organization } from '../models/organization.model.js';
import { User } from '../models/user.model.js';
import { Lead } from '../models/lead.model.js';
import { Customer } from '../models/customer.model.js';
import { Quote } from '../models/quote.model.js';
import { Pipeline } from '../models/pipeline.model.js';
import { Project } from '../models/project.model.js';
import { Task } from '../models/task.model.js';
import { Deal } from '../models/deal.model.js';
import { Client } from '../models/client.model.js';
import mongoose from 'mongoose';

const router = express.Router();

// All routes are protected and require authentication
router.use(protectRoute);

// Validate organization_id and user_id
const validateIds = async (req, res, next) => {
    const { organization_id, user_id } = req.body;
    
    if (!organization_id) {
        return res.status(400).json({
            success: false,
            message: "organization_id is required"
        });
    }
    
    if (!user_id) {
        return res.status(400).json({
            success: false,
            message: "user_id is required"
        });
    }

    // Find organization by org_id
    const organization = await Organization.findOne({ org_id: organization_id });
    if (!organization) {
        return res.status(404).json({
            success: false,
            message: "Organization not found"
        });
    }

    // Find user by user_id
    const user = await User.findOne({ user_id });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    // Add organization and user to request
    req.organization = organization;
    req.user = user;
    
    next();
};

/**
 * @route POST /api/analytics/dashboard
 * @desc Get comprehensive dashboard analytics for an organization
 * @access Private
 */
router.post('/dashboard', validateIds, async (req, res) => {
    try {
        const { organization_id, startDate, endDate } = req.body;
        
        // Set default date range if not provided (last 30 days)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Find organization
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        // Get counts for all entities
        const [
            leadsCount,
            customersCount,
            quotesCount,
            pipelineCount,
            projectsCount,
            tasksCount,
            dealsCount,
            clientsCount
        ] = await Promise.all([
            Lead.countDocuments({ organization: organization._id }),
            Customer.countDocuments({ organization: organization._id }),
            Quote.countDocuments({ organization: organization._id }),
            Pipeline.countDocuments({ organization: organization._id }),
            Project.countDocuments({ organization: organization._id }),
            Task.countDocuments({ organization: organization._id }),
            Deal.countDocuments({ organization: organization._id }),
            Client.countDocuments({ organization: organization._id })
        ]);
        
        // Get recent activity (last 7 days)
        const recentActivity = await Promise.all([
            // Recent leads
            Lead.find({ 
                organization: organization._id,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email status createdAt'),
            
            // Recent customers
            Customer.find({ 
                organization: organization._id,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email status createdAt'),
            
            // Recent quotes
            Quote.find({ 
                organization: organization._id,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title amount status createdAt'),
            
            // Recent pipeline deals
            Pipeline.find({ 
                organization: organization._id,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title amount stage createdAt')
        ]);
        
        // Get status distribution for leads
        const leadStatusDistribution = await Lead.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get status distribution for customers
        const customerStatusDistribution = await Customer.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get status distribution for quotes
        const quoteStatusDistribution = await Quote.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get stage distribution for pipeline
        const pipelineStageDistribution = await Pipeline.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: '$stage', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get status distribution for projects
        const projectStatusDistribution = await Project.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get status distribution for tasks
        const taskStatusDistribution = await Task.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get total value of quotes
        const totalQuoteValue = await Quote.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        // Get total value of pipeline deals
        const totalPipelineValue = await Pipeline.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        // Get total value of deals
        const totalDealValue = await Deal.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        // Get monthly trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyTrends = await Promise.all([
            // Monthly leads
            Lead.aggregate([
                { 
                    $match: { 
                        organization: organization._id,
                        createdAt: { $gte: sixMonthsAgo }
                    } 
                },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    } 
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            
            // Monthly customers
            Customer.aggregate([
                { 
                    $match: { 
                        organization: organization._id,
                        createdAt: { $gte: sixMonthsAgo }
                    } 
                },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    } 
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            
            // Monthly quotes
            Quote.aggregate([
                { 
                    $match: { 
                        organization: organization._id,
                        createdAt: { $gte: sixMonthsAgo }
                    } 
                },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        total: { $sum: '$amount' }
                    } 
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);
        
        res.json({
            success: true,
            data: {
                counts: {
                    leads: leadsCount,
                    customers: customersCount,
                    quotes: quotesCount,
                    pipeline: pipelineCount,
                    projects: projectsCount,
                    tasks: tasksCount,
                    deals: dealsCount,
                    clients: clientsCount
                },
                recentActivity: {
                    leads: recentActivity[0],
                    customers: recentActivity[1],
                    quotes: recentActivity[2],
                    pipeline: recentActivity[3]
                },
                statusDistribution: {
                    leads: leadStatusDistribution,
                    customers: customerStatusDistribution,
                    quotes: quoteStatusDistribution,
                    pipeline: pipelineStageDistribution,
                    projects: projectStatusDistribution,
                    tasks: taskStatusDistribution
                },
                totalValues: {
                    quotes: totalQuoteValue.length > 0 ? totalQuoteValue[0].total : 0,
                    pipeline: totalPipelineValue.length > 0 ? totalPipelineValue[0].total : 0,
                    deals: totalDealValue.length > 0 ? totalDealValue[0].total : 0
                },
                monthlyTrends: {
                    leads: monthlyTrends[0],
                    customers: monthlyTrends[1],
                    quotes: monthlyTrends[2]
                }
            }
        });
    } catch (error) {
        console.error('Error in dashboard analytics:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route POST /api/analytics/sales
 * @desc Get detailed sales analytics for an organization
 * @access Private
 */
router.post('/sales', validateIds, async (req, res) => {
    try {
        const { organization_id, startDate, endDate } = req.body;
        
        // Set default date range if not provided (last 30 days)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Define twelveMonthsAgo here
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        // Calculate conversion rates
        const [leadStats, quoteStats] = await Promise.all([
            // Lead to Customer conversion
            Customer.aggregate([
                { 
                    $match: { 
                        organization: organization._id,
                        createdAt: { $gte: twelveMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalLeads: { $sum: 1 },
                        convertedLeads: {
                            $sum: {
                                $cond: [
                                    { $gt: ["$totalValue", 0] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]),
            // Quote to Deal conversion
            Quote.aggregate([
                {
                    $match: {
                        organization: organization._id,
                        createdAt: { $gte: twelveMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalQuotes: { $sum: 1 },
                        acceptedQuotes: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "Accepted"] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ])
        ]);

        // Calculate conversion rates with fallback to 0 if no data
        const leadToCustomer = leadStats.length > 0 
            ? (leadStats[0].convertedLeads / leadStats[0].totalLeads) * 100 
            : 0;
        
        const quoteToDeal = quoteStats.length > 0 
            ? (quoteStats[0].acceptedQuotes / quoteStats[0].totalQuotes) * 100 
            : 0;

        // Enhanced pipeline stage distribution with more details
        const pipelineStages = await Pipeline.aggregate([
            { $match: { organization: organization._id } },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'client',
                    foreignField: '_id',
                    as: 'clientDetails'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedToDetails'
                }
            },
            {
                $group: {
                    _id: '$stage',
                    count: { $sum: 1 },
                    total: { $sum: '$amount' },
                    avgDealSize: { $avg: '$amount' },
                    deals: {
                        $push: {
                            pipeline_id: '$pipeline_id',
                            title: '$title',
                            amount: '$amount',
                            probability: '$probability',
                            expectedCloseDate: '$expectedCloseDate',
                            client: { $arrayElemAt: ['$clientDetails', 0] },
                            assignedTo: { $arrayElemAt: ['$assignedToDetails', 0] }
                        }
                    }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Enhanced quote value distribution with more details
        const quoteValueByStatus = await Quote.aggregate([
            { $match: { organization: organization._id } },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'client',
                    foreignField: '_id',
                    as: 'clientDetails'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByDetails'
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    total: { $sum: '$amount' },
                    avgQuoteValue: { $avg: '$amount' },
                    quotes: {
                        $push: {
                            quote_id: '$quote_id',
                            title: '$title',
                            amount: '$amount',
                            validUntil: '$validUntil',
                            client: { $arrayElemAt: ['$clientDetails', 0] },
                            createdBy: { $arrayElemAt: ['$createdByDetails', 0] },
                            items: '$items'
                        }
                    }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Enhanced top customers with more metrics
        const topCustomers = await Customer.aggregate([
            { $match: { organization: organization._id } },
            {
                $lookup: {
                    from: 'deals',
                    localField: '_id',
                    foreignField: 'client',
                    as: 'deals'
                }
            },
            {
                $lookup: {
                    from: 'quotes',
                    localField: '_id',
                    foreignField: 'client',
                    as: 'quotes'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    company: 1,
                    email: 1,
                    phone: 1,
                    totalValue: 1,
                    lastPurchase: 1,
                    dealsCount: { $size: '$deals' },
                    quotesCount: { $size: '$quotes' },
                    avgDealSize: { $avg: '$deals.amount' },
                    totalQuoteValue: { $sum: '$quotes.amount' },
                    recentDeals: {
                        $slice: [{
                            $sortArray: {
                                input: '$deals',
                                sortBy: { createdAt: -1 }
                            }
                        }, 3]
                    }
                }
            },
            { $sort: { totalValue: -1 } },
            { $limit: 5 }
        ]);

        // Enhanced sales by month with more metrics
        const salesByMonth = await Promise.all([
            Quote.aggregate([
                { 
                    $match: { 
                        organization: organization._id,
                        createdAt: { $gte: twelveMonthsAgo }
                    } 
                },
                {
                    $lookup: {
                        from: 'clients',
                        localField: 'client',
                        foreignField: '_id',
                        as: 'clientDetails'
                    }
                },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        total: { $sum: '$amount' },
                        accepted: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } },
                        acceptedValue: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, '$amount', 0] } },
                        avgQuoteValue: { $avg: '$amount' },
                        quotes: {
                            $push: {
                                quote_id: '$quote_id',
                                title: '$title',
                                amount: '$amount',
                                status: '$status',
                                client: { $arrayElemAt: ['$clientDetails', 0] }
                            }
                        }
                    } 
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            
            // Enhanced deals by month
            Deal.aggregate([
                { 
                    $match: { 
                        organization: organization._id,
                        createdAt: { $gte: twelveMonthsAgo }
                    } 
                },
                {
                    $lookup: {
                        from: 'clients',
                        localField: 'client',
                        foreignField: '_id',
                        as: 'clientDetails'
                    }
                },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        total: { $sum: '$amount' },
                        avgDealSize: { $avg: '$amount' },
                        deals: {
                            $push: {
                                deal_id: '$deal_id',
                                title: '$title',
                                amount: '$amount',
                                status: '$status',
                                client: { $arrayElemAt: ['$clientDetails', 0] }
                            }
                        }
                    } 
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);

        // Enhanced top performers with more metrics
        const topPerformers = await Promise.all([
            Quote.aggregate([
                { $match: { organization: organization._id } },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $group: {
                        _id: '$createdBy',
                        count: { $sum: 1 },
                        total: { $sum: '$amount' },
                        avgQuoteValue: { $avg: '$amount' },
                        successRate: {
                            $avg: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
                        },
                        recentQuotes: {
                            $push: {
                                quote_id: '$quote_id',
                                title: '$title',
                                amount: '$amount',
                                status: '$status',
                                createdAt: '$createdAt'
                            }
                        }
                    }
                },
                { $sort: { total: -1 } },
                { $limit: 5 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                conversionRates: {
                    leadToCustomer: parseFloat(leadToCustomer.toFixed(2)),
                    quoteToDeal: parseFloat(quoteToDeal.toFixed(2))
                },
                pipelineStages,
                quoteValueByStatus,
                topCustomers,
                salesByMonth: {
                    quotes: salesByMonth[0],
                    deals: salesByMonth[1]
                },
                topPerformers: {
                    quotes: topPerformers[0],
                    deals: topPerformers[1]
                }
            }
        });
    } catch (error) {
        console.error('Error in sales analytics:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route POST /api/analytics/projects
 * @desc Get detailed project analytics for an organization
 * @access Private
 */
router.post('/projects', validateIds, async (req, res) => {
    try {
        const { organization_id } = req.body;
        const organization = await Organization.findOne({ org_id: organization_id });

        // Enhanced project details with team members, tasks, and milestones
        const detailedProjects = await Project.aggregate([
            { $match: { organization: organization._id } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'teamMembers',
                    foreignField: '_id',
                    as: 'teamDetails'
                }
            },
            {
                $lookup: {
                    from: 'tasks',
                    localField: '_id',
                    foreignField: 'project',
                    as: 'projectTasks'
                }
            },
            {
                $lookup: {
                    from: 'milestones',
                    localField: '_id',
                    foreignField: 'project',
                    as: 'milestones'
                }
            },
            {
                $project: {
                    project_id: 1,
                    name: 1,
                    description: 1,
                    status: 1,
                    priority: 1,
                    startDate: 1,
                    deadline: 1,
                    completionDate: 1,
                    budget: 1,
                    actualCost: 1,
                    progress: {
                        $multiply: [
                            {
                                $divide: [
                                    { 
                                        $size: {
                                            $filter: {
                                                input: '$projectTasks',
                                                as: 'task',
                                                cond: { $eq: ['$$task.status', 'Completed'] }
                                            }
                                        }
                                    },
                                    { $max: [{ $size: '$projectTasks' }, 1] }
                                ]
                            },
                            100
                        ]
                    },
                    team: {
                        $map: {
                            input: '$teamDetails',
                            as: 'member',
                            in: {
                                _id: '$$member._id',
                                name: '$$member.name',
                                role: '$$member.role',
                                department: '$$member.department',
                                tasksAssigned: {
                                    $size: {
                                        $filter: {
                                            input: '$projectTasks',
                                            as: 'task',
                                            cond: { $eq: ['$$task.assignedTo', '$$member._id'] }
                                        }
                                    }
                                },
                                tasksCompleted: {
                                    $size: {
                                        $filter: {
                                            input: '$projectTasks',
                                            as: 'task',
                                            cond: { 
                                                $and: [
                                                    { $eq: ['$$task.assignedTo', '$$member._id'] },
                                                    { $eq: ['$$task.status', 'Completed'] }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    taskAnalytics: {
                        total: { $size: '$projectTasks' },
                        byStatus: {
                            notStarted: {
                                $size: {
                                    $filter: {
                                        input: '$projectTasks',
                                        as: 'task',
                                        cond: { $eq: ['$$task.status', 'Not Started'] }
                                    }
                                }
                            },
                            inProgress: {
                                $size: {
                                    $filter: {
                                        input: '$projectTasks',
                                        as: 'task',
                                        cond: { $eq: ['$$task.status', 'In Progress'] }
                                    }
                                }
                            },
                            completed: {
                                $size: {
                                    $filter: {
                                        input: '$projectTasks',
                                        as: 'task',
                                        cond: { $eq: ['$$task.status', 'Completed'] }
                                    }
                                }
                            }
                        },
                        byPriority: {
                            low: {
                                $size: {
                                    $filter: {
                                        input: '$projectTasks',
                                        as: 'task',
                                        cond: { $eq: ['$$task.priority', 'Low'] }
                                    }
                                }
                            },
                            medium: {
                                $size: {
                                    $filter: {
                                        input: '$projectTasks',
                                        as: 'task',
                                        cond: { $eq: ['$$task.priority', 'Medium'] }
                                    }
                                }
                            },
                            high: {
                                $size: {
                                    $filter: {
                                        input: '$projectTasks',
                                        as: 'task',
                                        cond: { $eq: ['$$task.priority', 'High'] }
                                    }
                                }
                            }
                        }
                    },
                    milestoneProgress: {
                        total: { $size: '$milestones' },
                        completed: {
                            $size: {
                                $filter: {
                                    input: '$milestones',
                                    as: 'milestone',
                                    cond: { $eq: ['$$milestone.status', 'Completed'] }
                                }
                            }
                        },
                        upcoming: {
                            $filter: {
                                input: '$milestones',
                                as: 'milestone',
                                cond: { 
                                    $and: [
                                        { $gt: ['$$milestone.dueDate', new Date()] },
                                        { $ne: ['$$milestone.status', 'Completed'] }
                                    ]
                                }
                            }
                        }
                    },
                    timeMetrics: {
                        totalDuration: {
                            $divide: [
                                { $subtract: ['$deadline', '$startDate'] },
                                (1000 * 60 * 60 * 24) // Convert to days
                            ]
                        },
                        daysRemaining: {
                            $divide: [
                                { $subtract: ['$deadline', new Date()] },
                                (1000 * 60 * 60 * 24)
                            ]
                        },
                        isOverdue: {
                            $and: [
                                { $lt: ['$deadline', new Date()] },
                                { $ne: ['$status', 'Completed'] }
                            ]
                        }
                    }
                }
            }
        ]);

        // Enhanced resource allocation metrics
        const resourceMetrics = await Task.aggregate([
            { $match: { organization: organization._id } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assigneeDetails'
                }
            },
            {
                $group: {
                    _id: {
                        userId: { $arrayElemAt: ['$assigneeDetails._id', 0] },
                        userName: { $arrayElemAt: ['$assigneeDetails.name', 0] },
                        userRole: { $arrayElemAt: ['$assigneeDetails.role', 0] }
                    },
                    totalTasks: { $sum: 1 },
                    notStartedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'Not Started'] }, 1, 0] }
                    },
                    inProgressTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
                    },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    lowPriorityTasks: {
                        $sum: { $cond: [{ $eq: ['$priority', 'Low'] }, 1, 0] }
                    },
                    mediumPriorityTasks: {
                        $sum: { $cond: [{ $eq: ['$priority', 'Medium'] }, 1, 0] }
                    },
                    highPriorityTasks: {
                        $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] }
                    },
                    onTimeCompletions: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $eq: ['$status', 'Completed'] },
                                        { $lte: ['$completedAt', '$dueDate'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    upcomingTasks: {
                        $push: {
                            $cond: [
                                { 
                                    $and: [
                                        { $gt: ['$dueDate', new Date()] },
                                        { $lt: ['$dueDate', new Date(new Date().setDate(new Date().getDate() + 7))] }
                                    ]
                                },
                                {
                                    taskId: '$_id',
                                    title: '$title',
                                    dueDate: '$dueDate',
                                    priority: '$priority'
                                },
                                null
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    userName: '$_id.userName',
                    userRole: '$_id.userRole',
                    workload: {
                        total: '$totalTasks',
                        byStatus: {
                            notStarted: '$notStartedTasks',
                            inProgress: '$inProgressTasks',
                            completed: '$completedTasks'
                        },
                        byPriority: {
                            low: '$lowPriorityTasks',
                            medium: '$mediumPriorityTasks',
                            high: '$highPriorityTasks'
                        }
                    },
                    performance: {
                        completionRate: {
                            $cond: [
                                { $eq: ['$totalTasks', 0] },
                                0,
                                {
                                    $multiply: [
                                        { $divide: ['$completedTasks', '$totalTasks'] },
                                        100
                                    ]
                                }
                            ]
                        },
                        onTimeCompletion: {
                            $cond: [
                                { $eq: ['$completedTasks', 0] },
                                0,
                                {
                                    $multiply: [
                                        { $divide: ['$onTimeCompletions', '$completedTasks'] },
                                        100
                                    ]
                                }
                            ]
                        }
                    },
                    upcomingTasks: {
                        $filter: {
                            input: '$upcomingTasks',
                            as: 'task',
                            cond: { $ne: ['$$task', null] }
                        }
                    }
                }
            }
        ]);

        // Keep existing aggregations and add new ones
        res.json({
            success: true,
            data: {
                projectDetails: detailedProjects,
                resourceMetrics,
                projectStatusDistribution: await Project.aggregate([
            { $match: { organization: organization._id } },
                    { 
                        $group: { 
                            _id: '$status',
                            count: { $sum: 1 },
                            totalBudget: { $sum: '$budget' },
                            averageProgress: { $avg: '$progress' }
                        }
                    },
            { $sort: { count: -1 } }
                ]),
                projectPriorityDistribution: await Project.aggregate([
            { $match: { organization: organization._id } },
                    { 
                        $group: { 
                            _id: '$priority',
                            count: { $sum: 1 },
                            averageCompletion: { $avg: '$progress' },
                            totalTasks: { $sum: { $size: '$tasks' } }
                        }
                    },
            { $sort: { count: -1 } }
                ]),
                taskMetrics: {
                    statusDistribution: await Task.aggregate([
                        { $match: { organization: organization._id } },
                        { 
                            $group: { 
                                _id: '$status',
                                count: { $sum: 1 },
                                averageCompletionTime: {
                                    $avg: {
                                        $cond: [
                                            { $eq: ['$status', 'Completed'] },
                                            { $subtract: ['$completedAt', '$createdAt'] },
                                            null
                                        ]
                                    }
                                }
                            }
                        },
                        { $sort: { count: -1 } }
                    ]),
                    priorityDistribution: await Task.aggregate([
                        { $match: { organization: organization._id } },
                        { 
                            $group: { 
                                _id: '$priority',
                                count: { $sum: 1 },
                                completedCount: {
                                    $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                                }
                            }
                        },
                        { $sort: { count: -1 } }
                    ])
                },
                timelineMetrics: {
                    projectsByMonth: await Project.aggregate([
            { 
                $match: { 
                    organization: organization._id,
                                createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
                } 
            },
            { 
                $group: { 
                    _id: { 
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                                completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
                                totalBudget: { $sum: '$budget' },
                                averageProgress: { $avg: '$progress' }
                } 
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
                    ]),
                    tasksByMonth: await Task.aggregate([
            { 
                $match: { 
                    organization: organization._id,
                                createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
                } 
            },
            { 
                $group: { 
                    _id: { 
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                                completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
                                averageCompletionTime: {
                                    $avg: {
                                        $cond: [
                                            { $eq: ['$status', 'Completed'] },
                                            { $subtract: ['$completedAt', '$createdAt'] },
                                            null
                                        ]
                        } 
                    }
                } 
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
                    ])
                },
                performanceMetrics: {
                    topPerformers: {
                        projects: await Project.aggregate([
            { $match: { organization: organization._id } },
                            { 
                                $group: { 
                                    _id: '$createdBy',
                                    count: { $sum: 1 },
                                    completedProjects: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
                                    totalBudget: { $sum: '$budget' },
                                    averageProgress: { $avg: '$progress' }
                                }
                            },
                            { $sort: { completedProjects: -1 } },
            { $limit: 5 },
            { 
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
                            { 
                                $project: { 
                                    _id: 1,
                                    name: '$user.name',
                                    role: '$user.role',
                                    metrics: {
                                        totalProjects: '$count',
                                        completedProjects: '$completedProjects',
                                        successRate: {
                                            $multiply: [
                                                { $divide: ['$completedProjects', '$count'] },
                                                100
                                            ]
                                        },
                                        totalBudget: '$totalBudget',
                                        averageProgress: '$averageProgress'
                                    }
                                }
                            }
                        ]),
                        tasks: await Task.aggregate([
            { $match: { organization: organization._id } },
                            { 
                                $group: { 
                                    _id: '$assignedTo',
                                    totalTasks: { $sum: 1 },
                                    completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
                                    onTimeTasks: {
                $sum: { 
                                            $cond: [
                                                { 
                                                    $and: [
                                                        { $eq: ['$status', 'Completed'] },
                                                        { $lte: ['$completedAt', '$dueDate'] }
                                                    ]
                                                },
                                                1,
                                                0
                                            ]
                                        }
                                    }
                                }
                            },
                            { $sort: { completedTasks: -1 } },
            { $limit: 5 },
            { 
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
                            { 
                                $project: { 
                                    _id: 1,
                                    name: '$user.name',
                                    role: '$user.role',
                                    metrics: {
                                        totalTasks: '$totalTasks',
                                        completedTasks: '$completedTasks',
                                        completionRate: {
                                            $multiply: [
                                                { $divide: ['$completedTasks', '$totalTasks'] },
                                                100
                                            ]
                                        },
                                        onTimeCompletion: {
                                            $multiply: [
                                                { $divide: ['$onTimeTasks', '$completedTasks'] },
                                                100
                                            ]
                                        }
                                    }
                                }
                            }
                        ])
                    }
                },
                riskMetrics: {
                    overdueTasks: await Task.countDocuments({
            organization: organization._id,
            dueDate: { $lt: new Date() },
            status: { $ne: 'Completed' }
                    }),
                    upcomingDeadlines: await Project.find({
            organization: organization._id,
            deadline: { 
                $gte: new Date(),
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            status: { $ne: 'Completed' }
        })
                    .select('name deadline status priority progress budget')
        .sort({ deadline: 1 })
                    .limit(10)
                }
            }
        });
    } catch (error) {
        console.error('Error in project analytics:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route POST /api/analytics/customers
 * @desc Get detailed customer analytics for an organization
 * @access Private
 */
router.post('/customers', validateIds, async (req, res) => {
    try {
        const { organization_id, startDate, endDate } = req.body;
        
        // Set default date range if not provided (last 30 days)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Find organization
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        // Get customer status distribution
        const customerStatusDistribution = await Customer.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get customers by month (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        const customersByMonth = await Customer.aggregate([
            { 
                $match: { 
                    organization: organization._id,
                    createdAt: { $gte: twelveMonthsAgo }
                } 
            },
            { 
                $group: { 
                    _id: { 
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                } 
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        // Get top customers by value
        const topCustomersByValue = await Customer.find({ organization: organization._id })
            .sort({ totalValue: -1 })
            .limit(10)
            .select('name totalValue lastPurchase status');
        
        // Get customer acquisition sources
        const customerSources = await Lead.aggregate([
            { 
                $match: { 
                    organization: organization._id,
                    status: 'Converted'
                } 
            },
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get customer lifetime value
        const customerLifetimeValue = await Customer.aggregate([
            { $match: { organization: organization._id } },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: '$totalValue' },
                    count: { $sum: 1 },
                    avgValue: { $avg: '$totalValue' }
                } 
            }
        ]);
        
        // Get customer retention rate
        const totalCustomers = await Customer.countDocuments({ organization: organization._id });
        const activeCustomers = await Customer.countDocuments({ 
            organization: organization._id,
            status: 'Active'
        });
        const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;
        
        // Get customer quotes
        const customerQuotes = await Quote.aggregate([
            { $match: { organization: organization._id } },
            { $group: { _id: '$client', count: { $sum: 1 }, total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
            { $limit: 10 },
            { 
                $lookup: {
                    from: 'customers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            { $project: { _id: 1, name: '$customer.name', count: 1, total: 1 } }
        ]);
        
        res.json({
            success: true,
            data: {
                customerStatusDistribution,
                customersByMonth,
                topCustomersByValue,
                customerSources,
                customerLifetimeValue: customerLifetimeValue.length > 0 ? customerLifetimeValue[0] : { total: 0, count: 0, avgValue: 0 },
                retentionRate,
                customerQuotes
            }
        });
    } catch (error) {
        console.error('Error in customer analytics:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route POST /api/analytics/performance
 * @desc Get detailed performance analytics for an organization
 * @access Private
 */
router.post('/performance', validateIds, async (req, res) => {
    try {
        const { organization_id, startDate, endDate } = req.body;
        
        // Set default date range if not provided (last 30 days)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Find organization
        const organization = await Organization.findOne({ org_id: organization_id });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        // Get all users in the organization
        const users = await User.find({ organization: organization._id })
            .select('_id name email role');
        
        // Get user performance metrics
        const userPerformance = await Promise.all(users.map(async (user) => {
            // Get leads created by user
            const leadsCreated = await Lead.countDocuments({ 
                organization: organization._id,
                createdBy: user._id
            });
            
            // Get leads converted by user
            const leadsConverted = await Lead.countDocuments({ 
                organization: organization._id,
                createdBy: user._id,
                status: 'Converted'
            });
            
            // Get quotes created by user
            const quotesCreated = await Quote.countDocuments({ 
                organization: organization._id,
                createdBy: user._id
            });
            
            // Get quotes accepted by user
            const quotesAccepted = await Quote.countDocuments({ 
                organization: organization._id,
                createdBy: user._id,
                status: 'Accepted'
            });
            
            // Get deals created by user
            const dealsCreated = await Deal.countDocuments({ 
                organization: organization._id,
                createdBy: user._id
            });
            
            // Get tasks assigned to user
            const tasksAssigned = await Task.countDocuments({ 
                organization: organization._id,
                assignedTo: user._id
            });
            
            // Get tasks completed by user
            const tasksCompleted = await Task.countDocuments({ 
                organization: organization._id,
                assignedTo: user._id,
                status: 'Completed'
            });
            
            // Get projects created by user
            const projectsCreated = await Project.countDocuments({ 
                organization: organization._id,
                createdBy: user._id
            });
            
            // Get projects completed by user
            const projectsCompleted = await Project.countDocuments({ 
                organization: organization._id,
                createdBy: user._id,
                status: 'Completed'
            });
            
            // Calculate conversion rates
            const leadConversionRate = leadsCreated > 0 ? (leadsConverted / leadsCreated) * 100 : 0;
            const quoteConversionRate = quotesCreated > 0 ? (quotesAccepted / quotesCreated) * 100 : 0;
            const taskCompletionRate = tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0;
            const projectCompletionRate = projectsCreated > 0 ? (projectsCompleted / projectsCreated) * 100 : 0;
            
            return {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                metrics: {
                    leads: {
                        created: leadsCreated,
                        converted: leadsConverted,
                        conversionRate: leadConversionRate
                    },
                    quotes: {
                        created: quotesCreated,
                        accepted: quotesAccepted,
                        conversionRate: quoteConversionRate
                    },
                    deals: {
                        created: dealsCreated
                    },
                    tasks: {
                        assigned: tasksAssigned,
                        completed: tasksCompleted,
                        completionRate: taskCompletionRate
                    },
                    projects: {
                        created: projectsCreated,
                        completed: projectsCompleted,
                        completionRate: projectCompletionRate
                    }
                }
            };
        }));
        
        // Get team performance metrics
        const teamPerformance = await Promise.all([
            // Team lead conversion rate
            Lead.aggregate([
                { $match: { organization: organization._id } },
                { $group: { _id: '$createdBy', total: { $sum: 1 }, converted: { 
                    $sum: { 
                        $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] 
                    } 
                } } },
                { 
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                { $project: { 
                    _id: 1, 
                    name: '$user.name', 
                    total: 1, 
                    converted: 1,
                    conversionRate: { 
                        $multiply: [
                            { $divide: ['$converted', '$total'] },
                            100
                        ]
                    }
                } },
                { $sort: { conversionRate: -1 } }
            ]),
            
            // Team quote acceptance rate
            Quote.aggregate([
                { $match: { organization: organization._id } },
                { $group: { _id: '$createdBy', total: { $sum: 1 }, accepted: { 
                    $sum: { 
                        $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] 
                    } 
                } } },
                { 
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                { $project: { 
                    _id: 1, 
                    name: '$user.name', 
                    total: 1, 
                    accepted: 1,
                    acceptanceRate: { 
                        $multiply: [
                            { $divide: ['$accepted', '$total'] },
                            100
                        ]
                    }
                } },
                { $sort: { acceptanceRate: -1 } }
            ]),
            
            // Team task completion rate
            Task.aggregate([
                { $match: { organization: organization._id } },
                { $group: { _id: '$assignedTo', total: { $sum: 1 }, completed: { 
                    $sum: { 
                        $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] 
                    } 
                } } },
                { 
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                { $project: { 
                    _id: 1, 
                    name: '$user.name', 
                    total: 1, 
                    completed: 1,
                    completionRate: { 
                        $multiply: [
                            { $divide: ['$completed', '$total'] },
                            100
                        ]
                    }
                } },
                { $sort: { completionRate: -1 } }
            ])
        ]);
        
        // Get performance trends over time
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const performanceTrends = await Promise.all([
            // Monthly lead conversion rate
            Lead.aggregate([
                { 
                    $match: { 
                        organization: organization._id,
                        createdAt: { $gte: sixMonthsAgo }
                    } 
                },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        total: { $sum: 1 },
                        converted: { 
                            $sum: { 
                                $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] 
                            } 
                        }
                    } 
                },
                { 
                    $project: { 
                        _id: 1, 
                        total: 1, 
                        converted: 1,
                        conversionRate: { 
                            $multiply: [
                                { $divide: ['$converted', '$total'] },
                                100
                            ]
                        }
                    } 
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            
            // Monthly quote acceptance rate
            Quote.aggregate([
                { 
                    $match: { 
                        organization: organization._id,
                        createdAt: { $gte: sixMonthsAgo }
                    } 
                },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        total: { $sum: 1 },
                        accepted: { 
                            $sum: { 
                                $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] 
                            } 
                        }
                    } 
                },
                { 
                    $project: { 
                        _id: 1, 
                        total: 1, 
                        accepted: 1,
                        acceptanceRate: { 
                            $multiply: [
                                { $divide: ['$accepted', '$total'] },
                                100
                            ]
                        }
                    } 
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            
            // Monthly task completion rate
            Task.aggregate([
                { 
                    $match: { 
                        organization: organization._id,
                        createdAt: { $gte: sixMonthsAgo }
                    } 
                },
                { 
                    $group: { 
                        _id: { 
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        total: { $sum: 1 },
                        completed: { 
                            $sum: { 
                                $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] 
                            } 
                        }
                    } 
                },
                { 
                    $project: { 
                        _id: 1, 
                        total: 1, 
                        completed: 1,
                        completionRate: { 
                            $multiply: [
                                { $divide: ['$completed', '$total'] },
                                100
                            ]
                        }
                    } 
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);
        
        res.json({
            success: true,
            data: {
                userPerformance,
                teamPerformance: {
                    leadConversion: teamPerformance[0],
                    quoteAcceptance: teamPerformance[1],
                    taskCompletion: teamPerformance[2]
                },
                performanceTrends: {
                    leadConversion: performanceTrends[0],
                    quoteAcceptance: performanceTrends[1],
                    taskCompletion: performanceTrends[2]
                }
            }
        });
    } catch (error) {
        console.error('Error in performance analytics:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router; 