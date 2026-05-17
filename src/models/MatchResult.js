const mongoose = require('mongoose');

const MatchResultSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  poId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  grnIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GRN' }],
  invoiceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
  status: {
    type: String,
    enum: ['matched', 'partially_matched', 'mismatch', 'insufficient_documents'],
    default: 'insufficient_documents'
  },
  mismatchReasons: [String],
  itemLevelResults: [{
    sku: String,
    poQty: Number,
    grnQty: Number,
    invoiceQty: Number,
    status: String,
    reasons: [String]
  }],
  summary: String,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MatchResult', MatchResultSchema);
