# Database Migration Scripts

## Fix Null Loan IDs

**Purpose:** Assigns orphaned collections (with `loanId: null`) to the first loan in each borrower's loans array.

**When to run:**
- When you have collections that don't show up when filtering by loan
- After importing legacy data
- When collections were created before loans were properly assigned

### How to Run

From the backend directory:

```bash
cd /Users/manojkumar/Finance/backend
node scripts/fixNullLoanIds.js
```

### What it Does

1. Finds all collections with `loanId = null`
2. For each collection, checks if the borrower has loans in the `loans` array
3. If yes, assigns the collection to the first loan in the array
4. Logs all changes for review

### Safety

- The script only updates collections with `null` loanId
- It creates a detailed log of all changes
- Collections without a valid borrower or loans are skipped
- No data is deleted, only updated

### Example Output

```
=== Starting Migration: Fix Null Loan IDs ===

Connecting to MongoDB...
Connected to MongoDB

Found 4 collections with null loanId

✓ Updated collection 691ad75e1746282951d39222 for "John Doe"
  Due Date: 11/8/2025
  Status: received
  Assigned to Loan: 691ad7a01746282951d3925f (Principal: ₹5000)

=== Migration Summary ===
Total collections processed: 4
Successfully updated: 4
Skipped: 0

✓ Migration completed successfully
```

### Rollback

If you need to revert changes, you can manually update collections back to `null`:

```javascript
// In MongoDB shell or Compass
db.interestcollections.updateMany(
  { loanId: ObjectId("LOAN_ID_HERE") },
  { $set: { loanId: null } }
)
```
