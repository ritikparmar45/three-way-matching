const mongoose = require('mongoose');

const GRNItemSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  description: String,
  receivedQuantity: { type: Number, required: true }
});

const GRNSchema = new mongoose.Schema({
  grnNumber: { type: String, required: true },
  poNumber: { type: String, required: true },
  grnDate: { type: Date, required: true },
  rawText: String,
  parsedData: Object,
  items: [GRNItemSchema],
  uploadedFile: {
    filename: String,
    path: String,
    mimetype: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GRN', GRNSchema);
