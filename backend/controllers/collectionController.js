const { validationResult } = require('express-validator');
const InterestCollection = require('../models/InterestCollection');
const Borrower = require('../models/Borrower');

// List collections with optional filters
exports.listCollections = async (req, res) => {
  try {
    const { status, dueDate, borrowerId } = req.query;
    const filter = { ownerId: req.user.id };

    if (status) {
      filter.status = status;
    }

    if (dueDate) {
      const date = new Date(dueDate);
      filter.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    if (borrowerId) {
      filter.borrowerId = borrowerId;
    }

    const collections = await InterestCollection.find(filter)
      .populate('borrowerId', 'borrowerName principalAmount interestAmount interestIsPercent dateProvided notes loans')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: collections,
      count: collections.length
    });
  } catch (error) {
    console.error('List collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collections',
      error: error.message
    });
  }
};

// Mark collection as received
exports.markCollected = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const collection = await InterestCollection.findOne({
      _id: req.params.id,
      ownerId: req.user.id
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    const { collectedDate, amountCollected, notes } = req.body;

    // Update collection
    collection.collectedDate = collectedDate ? new Date(collectedDate) : new Date();
    collection.status = 'received';

    if (amountCollected !== undefined) {
      collection.amountCollected = amountCollected;
    } else {
      // Calculate amount from borrower
      const borrower = await Borrower.findById(collection.borrowerId);
      if (borrower) {
        collection.amountCollected = borrower.interestIsPercent
          ? (borrower.principalAmount * borrower.interestAmount) / 100
          : borrower.interestAmount;
      }
    }

    if (notes !== undefined) {
      collection.notes = notes;
    }

    await collection.save();

    res.json({
      success: true,
      message: 'Interest marked as collected',
      data: collection
    });
  } catch (error) {
    console.error('Mark collected error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking collection',
      error: error.message
    });
  }
};

// Mark collection as pending
exports.markPending = async (req, res) => {
  try {
    const collection = await InterestCollection.findOne({
      _id: req.params.id,
      ownerId: req.user.id
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    collection.status = 'pending';
    collection.collectedDate = null;
    collection.amountCollected = 0;

    await collection.save();

    res.json({
      success: true,
      message: 'Collection marked as pending',
      data: collection
    });
  } catch (error) {
    console.error('Mark pending error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking collection',
      error: error.message
    });
  }
};

// Get dashboard summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    // Get all borrowers for user
    const borrowers = await Borrower.find({
      ownerId: req.user.id,
      deleted: false
    });

    const borrowerIds = borrowers.map(b => b._id);

    // Total lent amount - sum across all loans (legacy + new loans array)
    const totalLent = borrowers.reduce((sum, borrower) => {
      let borrowerTotal = 0;

      // Add legacy loan if exists
      if (borrower.principalAmount) {
        borrowerTotal += borrower.principalAmount;
      }

      // Add loans from loans array
      if (borrower.loans && borrower.loans.length > 0) {
        borrowerTotal += borrower.loans.reduce((loanSum, loan) => loanSum + loan.principalAmount, 0);
      }

      return sum + borrowerTotal;
    }, 0);

    // Pending collections due today
    const dueToday = await InterestCollection.countDocuments({
      ownerId: req.user.id,
      status: 'pending',
      dueDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Upcoming collections (next 2 days)
    const upcoming = await InterestCollection.find({
      ownerId: req.user.id,
      status: 'pending',
      dueDate: {
        $gte: today,
        $lte: twoDaysFromNow
      }
    })
    .populate('borrowerId', 'borrowerName principalAmount interestAmount interestIsPercent dateProvided notes loans')
    .sort({ dueDate: 1 })
    .limit(10);

    // Overdue collections
    const overdue = await InterestCollection.find({
      ownerId: req.user.id,
      status: 'pending',
      dueDate: { $lt: today }
    })
    .populate('borrowerId', 'borrowerName principalAmount interestAmount interestIsPercent dateProvided notes loans')
    .sort({ dueDate: 1 });

    // Total interest collected this month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const collectedThisMonth = await InterestCollection.aggregate([
      {
        $match: {
          ownerId: req.user.id,
          status: 'received',
          collectedDate: { $gte: firstDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountCollected' }
        }
      }
    ]);

    const totalInterestThisMonth = collectedThisMonth.length > 0 ? collectedThisMonth[0].total : 0;

    res.json({
      success: true,
      data: {
        totalBorrowers: borrowers.length,
        totalLent,
        totalInterestThisMonth,
        dueToday,
        upcomingCount: upcoming.length,
        overdueCount: overdue.length,
        upcoming,
        overdue
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message
    });
  }
};
