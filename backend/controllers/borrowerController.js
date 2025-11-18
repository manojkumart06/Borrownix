const { validationResult } = require('express-validator');
const Borrower = require('../models/Borrower');
const InterestCollection = require('../models/InterestCollection');

// Helper function to generate monthly due dates
const generateMonthlyCollections = async (borrower, monthsCount = 12, loanId = null) => {
  const collections = [];
  const startDate = new Date(borrower.dateProvided);

  for (let i = 0; i < monthsCount; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);

    // Handle case where day doesn't exist in target month
    if (dueDate.getDate() !== startDate.getDate()) {
      dueDate.setDate(0); // Set to last day of previous month
    }

    collections.push({
      borrowerId: borrower._id,
      loanId: loanId, // Track which loan this collection belongs to
      ownerId: borrower.ownerId,
      dueDate: dueDate,
      status: 'pending',
      amountCollected: 0
    });
  }

  await InterestCollection.insertMany(collections);
};

// List all borrowers for current user
exports.listBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find({
      ownerId: req.user.id,
      deleted: false
    }).sort({ createdAt: -1 });

    // Get next due date for each borrower
    const borrowersWithDueDate = await Promise.all(
      borrowers.map(async (borrower) => {
        const nextDue = await InterestCollection.findOne({
          borrowerId: borrower._id,
          status: 'pending'
        }).sort({ dueDate: 1 });

        return {
          ...borrower.toObject(),
          nextDueDate: nextDue ? nextDue.dueDate : null,
          nextDueStatus: nextDue ? nextDue.status : null
        };
      })
    );

    res.json({
      success: true,
      data: borrowersWithDueDate,
      count: borrowersWithDueDate.length
    });
  } catch (error) {
    console.error('List borrowers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching borrowers',
      error: error.message
    });
  }
};

// Check for duplicate borrower by name
exports.checkDuplicateBorrower = async (req, res) => {
  try {
    const { borrowerName } = req.query;

    if (!borrowerName) {
      return res.status(400).json({
        success: false,
        message: 'Borrower name is required'
      });
    }

    // Case-insensitive search for existing borrower
    const existingBorrower = await Borrower.findOne({
      ownerId: req.user.id,
      borrowerName: { $regex: new RegExp(`^${borrowerName}$`, 'i') },
      deleted: false
    });

    if (existingBorrower) {
      // Count total loans (legacy + new loans array)
      let totalLoans = existingBorrower.loans ? existingBorrower.loans.length : 0;
      if (existingBorrower.principalAmount) {
        totalLoans += 1; // Legacy loan
      }

      return res.json({
        success: true,
        isDuplicate: true,
        borrower: {
          _id: existingBorrower._id,
          borrowerName: existingBorrower.borrowerName,
          totalLoans: totalLoans,
          createdAt: existingBorrower.createdAt
        }
      });
    }

    res.json({
      success: true,
      isDuplicate: false
    });
  } catch (error) {
    console.error('Check duplicate borrower error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking duplicate borrower',
      error: error.message
    });
  }
};

// Add a new loan to existing borrower
exports.addLoanToBorrower = async (req, res) => {
  try {
    const { borrowerId } = req.params;
    const {
      principalAmount,
      interestAmount,
      interestIsPercent,
      dateProvided,
      notes
    } = req.body;

    // Find the borrower
    const borrower = await Borrower.findOne({
      _id: borrowerId,
      ownerId: req.user.id,
      deleted: false
    });

    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }

    // Migrate legacy loan to loans array if exists
    if (borrower.principalAmount && borrower.dateProvided && !borrower.loans.length) {
      borrower.loans.push({
        principalAmount: borrower.principalAmount,
        interestAmount: borrower.interestAmount,
        interestIsPercent: borrower.interestIsPercent,
        dateProvided: borrower.dateProvided,
        notes: borrower.notes || '',
        status: 'active'
      });

      // Clear legacy fields
      borrower.principalAmount = undefined;
      borrower.interestAmount = undefined;
      borrower.interestIsPercent = false;
      borrower.dateProvided = undefined;
      borrower.notes = '';
    }

    // Add new loan to loans array
    borrower.loans.push({
      principalAmount,
      interestAmount,
      interestIsPercent: interestIsPercent || false,
      dateProvided: new Date(dateProvided),
      notes: notes || '',
      status: 'active'
    });

    await borrower.save();

    // Get the newly added loan
    const newLoan = borrower.loans[borrower.loans.length - 1];

    // Create a temporary borrower object for generating collections
    const tempBorrowerForCollections = {
      _id: borrower._id,
      ownerId: borrower.ownerId,
      dateProvided: new Date(dateProvided)
    };

    // Generate monthly interest collection records for the new loan
    await generateMonthlyCollections(tempBorrowerForCollections, 12, newLoan._id);

    res.status(201).json({
      success: true,
      message: 'Loan added successfully to existing borrower',
      data: {
        borrower,
        newLoan
      }
    });
  } catch (error) {
    console.error('Add loan to borrower error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding loan to borrower',
      error: error.message
    });
  }
};

// Create new borrower
exports.createBorrower = async (req, res) => {
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

    const {
      borrowerName,
      principalAmount,
      interestAmount,
      interestIsPercent,
      dateProvided,
      notes
    } = req.body;

    // Create borrower
    const borrower = new Borrower({
      ownerId: req.user.id,
      borrowerName,
      principalAmount,
      interestAmount,
      interestIsPercent: interestIsPercent || false,
      dateProvided: new Date(dateProvided),
      notes: notes || ''
    });

    await borrower.save();

    // Generate monthly interest collection records
    await generateMonthlyCollections(borrower);

    res.status(201).json({
      success: true,
      message: 'Borrower created successfully',
      data: borrower
    });
  } catch (error) {
    console.error('Create borrower error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating borrower',
      error: error.message
    });
  }
};

// Get single borrower
exports.getBorrower = async (req, res) => {
  try {
    const borrower = await Borrower.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
      deleted: false
    });

    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }

    res.json({
      success: true,
      data: borrower
    });
  } catch (error) {
    console.error('Get borrower error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching borrower',
      error: error.message
    });
  }
};

// Update borrower
exports.updateBorrower = async (req, res) => {
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

    const borrower = await Borrower.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
      deleted: false
    });

    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }

    // Update fields
    const allowedUpdates = [
      'borrowerName',
      'principalAmount',
      'interestAmount',
      'interestIsPercent',
      'dateProvided',
      'notes'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        borrower[field] = req.body[field];
      }
    });

    await borrower.save();

    res.json({
      success: true,
      message: 'Borrower updated successfully',
      data: borrower
    });
  } catch (error) {
    console.error('Update borrower error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating borrower',
      error: error.message
    });
  }
};

// Delete borrower (soft delete)
exports.deleteBorrower = async (req, res) => {
  try {
    const borrower = await Borrower.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
      deleted: false
    });

    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }

    borrower.deleted = true;
    await borrower.save();

    res.json({
      success: true,
      message: 'Borrower deleted successfully'
    });
  } catch (error) {
    console.error('Delete borrower error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting borrower',
      error: error.message
    });
  }
};

// Get interest collections for a borrower
exports.getBorrowerCollections = async (req, res) => {
  try {
    const borrower = await Borrower.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
      deleted: false
    });

    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }

    const collections = await InterestCollection.find({
      borrowerId: req.params.id
    }).sort({ dueDate: 1 });

    res.json({
      success: true,
      data: collections,
      count: collections.length
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collections',
      error: error.message
    });
  }
};
