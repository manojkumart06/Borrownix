const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const collectionController = require('../controllers/collectionController');

// All routes require authentication
router.use(authMiddleware);

// GET /api/collections - Get all collections with optional filters
router.get('/', collectionController.listCollections);

// PUT /api/collections/:id/mark-collected - Mark as collected
router.put(
  '/:id/mark-collected',
  [
    body('collectedDate').optional().isISO8601(),
    body('amountCollected').optional().isNumeric()
  ],
  collectionController.markCollected
);

// PUT /api/collections/:id/mark-pending - Mark as pending
router.put('/:id/mark-pending', collectionController.markPending);

// GET /api/collections/dashboard - Get dashboard summary
router.get('/dashboard/summary', collectionController.getDashboardSummary);

module.exports = router;
