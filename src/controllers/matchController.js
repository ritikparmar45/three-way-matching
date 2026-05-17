const MatchResult = require('../models/MatchResult');

/**
 * Get match results for a PO number
 */
exports.getMatchResult = async (req, res, next) => {
  try {
    const { poNumber } = req.params;

    const result = await MatchResult.findOne({ poNumber })
      .populate('poId')
      .populate('grnIds')
      .populate('invoiceIds');

    if (!result) {
      return res.status(404).json({ 
        success: false,
        message: 'No match results found for this PO number',
        status: 'insufficient_documents'
      });
    }

    res.json({
      success: true,
      data: {
        poNumber: result.poNumber,
        status: result.status,
        mismatchReasons: result.mismatchReasons,
        itemLevelResults: result.itemLevelResults,
        documents: {
          po: result.poId,
          grns: result.grnIds,
          invoices: result.invoiceIds
        },
        updatedAt: result.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
};
