const mongoose = require('mongoose');

const InterestCollectionSchema = new mongoose.Schema({
  borrowerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borrower',
    required: true,
    index: true
  },
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    // References the _id of a loan in the borrower's loans array
    // null for legacy single-loan borrowers
    default: null,
    index: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  collectedDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'missed', 'provided'],
    default: 'pending'
  },
  amountCollected: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
InterestCollectionSchema.index({ ownerId: 1, status: 1, dueDate: 1 });
InterestCollectionSchema.index({ borrowerId: 1, dueDate: 1 });

module.exports = mongoose.model('InterestCollection', InterestCollectionSchema);
