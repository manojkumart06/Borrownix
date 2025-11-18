const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const borrowerController = require('../controllers/borrowerController');

// All routes require authentication
router.use(authMiddleware);

// GET /api/borrowers/check-duplicate - Check for duplicate borrower name
router.get('/check-duplicate', borrowerController.checkDuplicateBorrower);

// GET /api/borrowers - List all borrowers for current user
router.get('/', borrowerController.listBorrowers);

// POST /api/borrowers - Create new borrower
router.post(
  '/',
  [
    body('borrowerName').trim().notEmpty().withMessage('Borrower name is required'),
    body('principalAmount').isNumeric().withMessage('Principal amount must be a number'),
    body('interestAmount').isNumeric().withMessage('Interest amount must be a number'),
    body('dateProvided').isISO8601().withMessage('Valid date is required')
  ],
  borrowerController.createBorrower
);

// GET /api/borrowers/:id - Get single borrower
router.get('/:id', borrowerController.getBorrower);

// PUT /api/borrowers/:id - Update borrower
router.put(
  '/:id',
  [
    body('borrowerName').optional().trim().notEmpty(),
    body('principalAmount').optional().isNumeric(),
    body('interestAmount').optional().isNumeric(),
    body('dateProvided').optional().isISO8601()
  ],
  borrowerController.updateBorrower
);

// DELETE /api/borrowers/:id - Delete borrower (soft delete)
router.delete('/:id', borrowerController.deleteBorrower);

// POST /api/borrowers/:id/loans - Add a new loan to existing borrower
router.post(
  '/:borrowerId/loans',
  [
    body('principalAmount').isNumeric().withMessage('Principal amount must be a number'),
    body('interestAmount').isNumeric().withMessage('Interest amount must be a number'),
    body('dateProvided').isISO8601().withMessage('Valid date is required')
  ],
  borrowerController.addLoanToBorrower
);

// GET /api/borrowers/:id/collections - Get interest collections for borrower
router.get('/:id/collections', borrowerController.getBorrowerCollections);

module.exports = router;
