const User = require('../models/User');
const Borrower = require('../models/Borrower');
const InterestCollection = require('../models/InterestCollection');

/**
 * Get all users with their login statistics
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ lastLoginAt: -1 })
      .lean();

    // Calculate additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const borrowerCount = await Borrower.countDocuments({
          ownerId: user._id,
          deleted: false
        });

        const collectionCount = await InterestCollection.countDocuments({
          ownerId: user._id
        });

        const pendingCollections = await InterestCollection.countDocuments({
          ownerId: user._id,
          status: 'pending'
        });

        // Determine online status (logged in within last 30 minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const isOnline = user.lastLoginAt && new Date(user.lastLoginAt) > thirtyMinutesAgo;

        return {
          ...user,
          stats: {
            borrowerCount,
            collectionCount,
            pendingCollections
          },
          isOnline
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats,
      count: usersWithStats.length
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Users logged in within last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogins = await User.countDocuments({
      lastLoginAt: { $gte: oneDayAgo }
    });

    // Total borrowers across all users
    const totalBorrowers = await Borrower.countDocuments({ deleted: false });

    // Total collections
    const totalCollections = await InterestCollection.countDocuments();
    const pendingCollections = await InterestCollection.countDocuments({ status: 'pending' });
    const receivedCollections = await InterestCollection.countDocuments({ status: 'received' });

    // Calculate total amount collected
    const collectionStats = await InterestCollection.aggregate([
      { $match: { status: 'received' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amountCollected' }
        }
      }
    ]);

    const totalAmountCollected = collectionStats.length > 0 ? collectionStats[0].totalAmount : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          recentLogins
        },
        borrowers: {
          total: totalBorrowers
        },
        collections: {
          total: totalCollections,
          pending: pendingCollections,
          received: receivedCollections,
          totalAmountCollected
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Update user status (activate/deactivate)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

/**
 * Get user activity log
 */
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent borrowers created by this user
    const recentBorrowers = await Borrower.find({
      ownerId: userId,
      deleted: false
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('borrowerName createdAt');

    // Get recent collections
    const recentCollections = await InterestCollection.find({
      ownerId: userId
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('borrowerId', 'borrowerName')
      .select('status amountCollected collectedDate dueDate updatedAt');

    res.json({
      success: true,
      data: {
        user,
        recentBorrowers,
        recentCollections
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
};
