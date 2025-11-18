const mongoose = require('mongoose');

// Loan sub-schema for tracking individual loans to a borrower
const LoanSchema = new mongoose.Schema({
  principalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  interestAmount: {
    type: Number,
    required: true,
    min: 0
  },
  interestIsPercent: {
    type: Boolean,
    default: false
  },
  dateProvided: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'paid_off', 'written_off'],
    default: 'active'
  }
}, {
  timestamps: true
});

const BorrowerSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  borrowerName: {
    type: String,
    required: true
  },
  // Array of loans for this borrower
  loans: {
    type: [LoanSchema],
    default: []
  },
  // Legacy fields for backward compatibility
  principalAmount: {
    type: Number,
    min: 0
  },
  interestAmount: {
    type: Number,
    min: 0
  },
  interestIsPercent: {
    type: Boolean,
    default: false
  },
  dateProvided: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
BorrowerSchema.index({ ownerId: 1, deleted: 1 });
BorrowerSchema.index({ ownerId: 1, borrowerName: 1 });

module.exports = mongoose.model('Borrower', BorrowerSchema);
