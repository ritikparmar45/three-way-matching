const PurchaseOrder = require('../models/PurchaseOrder');
const GRN = require('../models/GRN');
const Invoice = require('../models/Invoice');
const MatchResult = require('../models/MatchResult');

/**
 * Performs three-way matching for a given PO number
 * @param {string} poNumber 
 */
async function matchDocuments(poNumber) {
  try {
    // 1. Fetch all documents
    const po = await PurchaseOrder.findOne({ poNumber });
    const grns = await GRN.find({ poNumber });
    const invoices = await Invoice.find({ poNumber });

    if (!po) {
      await MatchResult.findOneAndUpdate(
        { poNumber },
        { 
          status: 'insufficient_documents', 
          summary: 'Purchase Order missing' 
        },
        { upsave: true, new: true, upsert: true }
      );
      return;
    }

    const mismatchReasons = [];
    const itemLevelResults = [];
    let overallStatus = 'matched';

    // 2. Aggregate Items from PO
    const poItemsMap = new Map();
    po.items.forEach(item => {
      poItemsMap.set(item.sku, {
        sku: item.sku,
        description: item.description,
        poQty: item.quantity,
        grnQty: 0,
        invoiceQty: 0
      });
    });

    // 3. Aggregate GRN Quantities
    grns.forEach(grn => {
      grn.items.forEach(item => {
        if (poItemsMap.has(item.sku)) {
          poItemsMap.get(item.sku).grnQty += item.receivedQuantity;
        } else {
          // Item not in PO
          if (!mismatchReasons.includes('item_missing_in_po')) {
            mismatchReasons.push('item_missing_in_po');
          }
          overallStatus = 'mismatch';
        }
      });
    });

    // 4. Aggregate Invoice Quantities
    invoices.forEach(invoice => {
      // Date Validation: Invoice date must not be after PO date
      if (new Date(invoice.invoiceDate) > new Date(po.poDate)) {
        if (!mismatchReasons.includes('invoice_date_after_po_date')) {
          mismatchReasons.push('invoice_date_after_po_date');
        }
        overallStatus = 'mismatch';
      }

      invoice.items.forEach(item => {
        if (poItemsMap.has(item.sku)) {
          poItemsMap.get(item.sku).invoiceQty += item.quantity;
        } else {
          // Item not in PO
          if (!mismatchReasons.includes('item_missing_in_po')) {
            mismatchReasons.push('item_missing_in_po');
          }
          overallStatus = 'mismatch';
        }
      });
    });

    // 5. Item Level Validation
    for (const [sku, data] of poItemsMap) {
      const itemReasons = [];
      let itemStatus = 'matched';

      // Rule A: GRN quantity must not exceed PO quantity
      if (data.grnQty > data.poQty) {
        itemReasons.push('grn_qty_exceeds_po_qty');
        itemStatus = 'mismatch';
      }

      // Rule B: Invoice quantity must not exceed total GRN quantity
      if (data.invoiceQty > data.grnQty) {
        itemReasons.push('invoice_qty_exceeds_grn_qty');
        itemStatus = 'mismatch';
      }

      // Rule C: Invoice quantity must not exceed PO quantity
      if (data.invoiceQty > data.poQty) {
        itemReasons.push('invoice_qty_exceeds_po_qty');
        itemStatus = 'mismatch';
      }

      // Partial Match check (if no mismatch but quantities don't match exactly yet)
      if (itemStatus === 'matched' && (data.grnQty < data.poQty || data.invoiceQty < data.poQty)) {
        itemStatus = 'partially_matched';
      }

      if (itemStatus === 'mismatch') {
        overallStatus = 'mismatch';
        itemReasons.forEach(r => {
          if (!mismatchReasons.includes(r)) mismatchReasons.push(r);
        });
      } else if (itemStatus === 'partially_matched' && overallStatus === 'matched') {
        overallStatus = 'partially_matched';
      }

      itemLevelResults.push({
        sku,
        poQty: data.poQty,
        grnQty: data.grnQty,
        invoiceQty: data.invoiceQty,
        status: itemStatus,
        reasons: itemReasons
      });
    }

    // 6. Final Status Determination
    if (grns.length === 0 || invoices.length === 0) {
      if (overallStatus !== 'mismatch') {
        overallStatus = 'insufficient_documents';
      }
    }

    // 7. Update MatchResult
    await MatchResult.findOneAndUpdate(
      { poNumber },
      {
        poId: po._id,
        grnIds: grns.map(g => g._id),
        invoiceIds: invoices.map(i => i._id),
        status: overallStatus,
        mismatchReasons,
        itemLevelResults,
        summary: `Match performed at ${new Date().toISOString()}`,
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );

  } catch (error) {
    console.error(`Error in matching engine for PO ${poNumber}:`, error);
    throw error;
  }
}

module.exports = {
  matchDocuments
};
