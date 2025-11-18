require('dotenv').config();
const mongoose = require('mongoose');
const Borrower = require('../models/Borrower');
const InterestCollection = require('../models/InterestCollection');

/**
 * Migration script to fix collections with null loanId
 *
 * This script:
 * 1. Finds all collections with loanId = null
 * 2. For each collection, checks if the borrower has loans in the loans array
 * 3. If yes, assigns the collection to the first loan in the array
 * 4. Logs all changes for review
 */

const fixNullLoanIds = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB\n');

    // Find all collections with null loanId
    const nullLoanIdCollections = await InterestCollection.find({
      loanId: null
    }).populate('borrowerId');

    console.log(`Found ${nullLoanIdCollections.length} collections with null loanId\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    const updates = [];

    for (const collection of nullLoanIdCollections) {
      if (!collection.borrowerId) {
        console.log(`⚠️  Skipping collection ${collection._id}: borrower not found`);
        skippedCount++;
        continue;
      }

      const borrower = collection.borrowerId;

      // Check if borrower has loans in the loans array
      if (!borrower.loans || borrower.loans.length === 0) {
        console.log(`⚠️  Skipping collection ${collection._id}: borrower "${borrower.borrowerName}" has no loans in loans array`);
        skippedCount++;
        continue;
      }

      // Assign to the first loan
      const firstLoan = borrower.loans[0];
      const oldLoanId = collection.loanId;
      collection.loanId = firstLoan._id;

      await collection.save();

      updatedCount++;
      updates.push({
        collectionId: collection._id,
        borrowerName: borrower.borrowerName,
        dueDate: collection.dueDate,
        status: collection.status,
        oldLoanId: oldLoanId,
        newLoanId: firstLoan._id.toString()
      });

      console.log(`✓ Updated collection ${collection._id} for "${borrower.borrowerName}"`);
      console.log(`  Due Date: ${collection.dueDate.toLocaleDateString()}`);
      console.log(`  Status: ${collection.status}`);
      console.log(`  Assigned to Loan: ${firstLoan._id} (Principal: ₹${firstLoan.principalAmount})\n`);
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total collections processed: ${nullLoanIdCollections.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    if (updates.length > 0) {
      console.log('\n=== Updated Collections ===');
      updates.forEach((update, index) => {
        console.log(`${index + 1}. Collection ${update.collectionId}`);
        console.log(`   Borrower: ${update.borrowerName}`);
        console.log(`   Due Date: ${new Date(update.dueDate).toLocaleDateString()}`);
        console.log(`   Status: ${update.status}`);
        console.log(`   New Loan ID: ${update.newLoanId}\n`);
      });
    }

    console.log('\n✓ Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the migration
console.log('=== Starting Migration: Fix Null Loan IDs ===\n');
fixNullLoanIds();
