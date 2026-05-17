const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');
const { validateUpload } = require('../middleware/validation');

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload and process a document (PO, GRN, or Invoice)
 *     tags: [Documents]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *                 enum: [po, grn, invoice]
 *     responses:
 *       201:
 *         description: Document uploaded and processed
 *       400:
 *         description: Invalid input
 */
router.post('/upload', upload.single('file'), validateUpload, documentController.uploadDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get document details
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [po, grn, invoice]
 *     responses:
 *       200:
 *         description: Document details
 *       404:
 *         description: Document not found
 */
router.get('/:id', documentController.getDocument);

module.exports = router;
