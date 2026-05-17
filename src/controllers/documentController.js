const PurchaseOrder = require('../models/PurchaseOrder');
const GRN = require('../models/GRN');
const Invoice = require('../models/Invoice');
const { parseDocument } = require('../services/geminiService');
const { matchDocuments } = require('../services/matchingService');

/**
 * Upload and process a document
 */
exports.uploadDocument = async (req, res, next) => {
  try {
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!['po', 'grn', 'invoice'].includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Parse document using Gemini
    const parsedData = await parseDocument(file, documentType);
    
    let savedDoc;
    let poNumberToMatch = parsedData.poNumber;

    if (documentType === 'po') {
      // Check if PO already exists
      const existingPO = await PurchaseOrder.findOne({ poNumber: parsedData.poNumber });
      if (existingPO) {
        return res.status(400).json({ 
          message: 'Purchase Order with this number already exists',
          mismatchReason: 'duplicate_po' 
        });
      }

      savedDoc = await PurchaseOrder.create({
        ...parsedData,
        uploadedFile: {
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype
        }
      });
    } else if (documentType === 'grn') {
      savedDoc = await GRN.create({
        ...parsedData,
        uploadedFile: {
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype
        }
      });
    } else if (documentType === 'invoice') {
      savedDoc = await Invoice.create({
        ...parsedData,
        uploadedFile: {
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype
        }
      });
    }

    // Trigger matching engine
    if (poNumberToMatch) {
      await matchDocuments(poNumberToMatch);
    }

    res.status(201).json({
      success: true,
      data: savedDoc,
      message: `${documentType.toUpperCase()} processed and matched successfully`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get document details by ID and type
 */
exports.getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // po, grn, invoice

    let doc;
    if (type === 'po') doc = await PurchaseOrder.findById(id);
    else if (type === 'grn') doc = await GRN.findById(id);
    else if (type === 'invoice') doc = await Invoice.findById(id);
    else return res.status(400).json({ message: 'Invalid or missing document type query param' });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};
