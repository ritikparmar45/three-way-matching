const mongoose = require('mongoose');

const POItemSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true }
});

const POSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  poDate: { type: Date, required: true },
  vendorName: String,
  rawText: String,
  parsedData: Object,
  items: [POItemSchema],
  uploadedFile: {
    filename: String,
    path: String,
    mimetype: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PurchaseOrder', POSchema);
