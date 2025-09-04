const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Goal = require('../models/Goal');
const Exercise = require('../models/Exercise');
const Workout = require('../models/Workout');
const Program = require('../models/Program');
const Notification = require('../models/Notification');
const { verifyAdmin } = require('../middleware/adminAuth');

// Apply admin middleware to all routes
router.use(verifyAdmin);

// ============= DASHBOARD STATISTICS =============
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalGoals,
      completedGoals,
      totalExercises,
      totalWorkouts,
      totalPrograms,
      contributorRequests,
      recentUsers,
      userGrowth,
      goalsByStatus
    ] = await Promise.all([
      // Basic counts
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      Goal.countDocuments({}),
      Goal.countDocuments({ status: 'completed' }),
      Exercise.countDocuments({}),
      Workout.countDocuments({}),
      Program.countDocuments({}),
      User.countDocuments({ contributorRequestPending: true }),
      
      // Recent users (last 30 days)
      User.find({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
      .select('firstName lastName email createdAt isContributor isAdmin')
      .sort({ createdAt: -1 })
      .limit(10),
      
      // User growth by month (last 6 months)
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
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

      // Goals by status
      Goal.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Calculate goal completion rate
    const goalCompletionRate = totalGoals > 0 ? 
      ((completedGoals / totalGoals) * 100).toFixed(1) : 0;

    // Calculate user activity metrics
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsersLast7Days = await User.countDocuments({
      lastLogin: { $gte: last7Days }
    });

    // Count users by role
    const adminCount = await User.countDocuments({ isAdmin: true });
    const contributorCount = await User.countDocuments({ isContributor: true });
    const regularUserCount = totalUsers - adminCount - contributorCount;

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          totalGoals,
          completedGoals,
          goalCompletionRate: parseFloat(goalCompletionRate),
          totalExercises,
          totalWorkouts,
          totalPrograms,
          contributorRequests,
          activeUsersLast7Days,
          usersByRole: {
            admin: adminCount,
            contributor: contributorCount,
            regular: regularUserCount
          }
        },
        recentUsers,
        userGrowth: userGrowth.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          users: item.count
        })),
        goalsByStatus: goalsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// ============= USER MANAGEMENT =============

// Get all users with pagination and filtering
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = 'all',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role !== 'all') {
      if (role === 'admin') filter.isAdmin = true;
      else if (role === 'contributor') filter.isContributor = true;
      else if (role === 'user') {
        filter.isAdmin = false;
        filter.isContributor = false;
      }
    }

    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .select('-password -twoFactorSecret')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalUsers = await User.countDocuments(filter);

    // Enhance users with goal counts
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const goalCount = await Goal.countDocuments({ user: user._id });
        const completedGoals = await Goal.countDocuments({ 
          user: user._id, 
          status: 'completed' 
        });
        
        return {
          ...user.toObject(),
          stats: {
            totalGoals: goalCount,
            completedGoals: completedGoals,
            completionRate: goalCount > 0 ? ((completedGoals / goalCount) * 100).toFixed(1) : 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page * limit < totalUsers,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get specific user details
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -twoFactorSecret');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's goals statistics
    const [userGoals, recentGoals] = await Promise.all([
      Goal.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Goal.find({ user: user._id })
        .select('title status startDate endDate progress')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const goalStats = {
      total: 0,
      active: 0,
      completed: 0,
      paused: 0,
      cancelled: 0
    };

    userGoals.forEach(stat => {
      goalStats[stat._id] = stat.count;
      goalStats.total += stat.count;
    });

    res.json({
      success: true,
      data: {
        user,
        goalStats,
        recentGoals,
        joinedDate: user.createdAt,
        lastActivity: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:userId/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive },
      { new: true }
    ).select('-password -twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

// Update user role
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { isAdmin, isContributor } = req.body;
    
    // Prevent admin from removing their own admin status
    if (req.params.userId === req.user._id.toString() && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove your own admin privileges'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { 
        isAdmin: Boolean(isAdmin),
        isContributor: Boolean(isContributor),
        contributorRequestPending: false, // Clear pending request
        contributorApplicationText: null, // Clear application text
        contributorRequestDate: null // Clear request date
      },
      { new: true }
    ).select('-password -twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
});

// Delete user (soft delete by deactivating)
router.delete('/users/:userId', async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: false },
      { new: true }
    ).select('-password -twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// ============= CONTRIBUTOR REQUESTS =============

// Get all contributor requests
router.get('/contributor-requests', async (req, res) => {
  try {
    const requests = await User.find({ contributorRequestPending: true })
      .select('firstName lastName email createdAt lastLogin contributorApplicationText contributorRequestDate')
      .sort({ contributorRequestDate: -1 });

    // Enhance with user activity data
    const enhancedRequests = await Promise.all(
      requests.map(async (user) => {
        const goalCount = await Goal.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          activityLevel: goalCount
        };
      })
    );

    res.json({
      success: true,
      data: enhancedRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contributor requests',
      error: error.message
    });
  }
});

// Approve/Deny contributor request
router.patch('/contributor-requests/:userId/:action', async (req, res) => {
  try {
    const { userId, action } = req.params;
    
    if (!['approve', 'deny'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "deny"'
      });
    }

    const updateData = {
      contributorRequestPending: false,
      contributorApplicationText: null,
      contributorRequestDate: null
    };

    if (action === 'approve') {
      updateData.isContributor = true;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password -twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `Contributor request ${action}d successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing contributor request',
      error: error.message
    });
  }
});

// ============= SYSTEM ANALYTICS =============

// Get system analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = parseInt(period);
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // User registrations over time
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Goal creation trends
    const goalTrends = await Goal.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Most active users
    const activeUsers = await Goal.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$user",
          goalCount: { $sum: 1 }
        }
      },
      { $sort: { goalCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $project: {
          goalCount: 1,
          user: {
            firstName: { $arrayElemAt: ["$userInfo.firstName", 0] },
            lastName: { $arrayElemAt: ["$userInfo.lastName", 0] },
            email: { $arrayElemAt: ["$userInfo.email", 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        userRegistrations,
        goalTrends,
        activeUsers,
        period: `${daysAgo} days`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// ============= CONTENT MANAGEMENT =============

// Get content statistics
router.get('/content/stats', async (req, res) => {
  try {
    const [exerciseStats, workoutStats, programStats] = await Promise.all([
      Exercise.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]),
      Workout.aggregate([
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 }
          }
        }
      ]),
      Program.aggregate([
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        exercisesByCategory: exerciseStats,
        workoutsByDifficulty: workoutStats,
        programsByDifficulty: programStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching content statistics',
      error: error.message
    });
  }
});

// ============= NOTIFICATIONS =============
// Get all notifications
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'firstName lastName email'),
      Notification.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// Get unread notification count
router.get('/notifications/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.patch('/notifications/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
});

module.exports = router;
