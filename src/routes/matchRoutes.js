const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

/**
 * @swagger
 * /api/match/{poNumber}:
 *   get:
 *     summary: Get three-way match results for a PO number
 *     tags: [Matching]
 *     parameters:
 *       - in: path
 *         name: poNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match results
 *       404:
 *         description: No results found
 */
router.get('/:poNumber', matchController.getMatchResult);

module.exports = router;
