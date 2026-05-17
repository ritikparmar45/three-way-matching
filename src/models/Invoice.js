const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true }
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  poNumber: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  rawText: String,
  parsedData: Object,
  items: [InvoiceItemSchema],
  uploadedFile: {
    filename: String,
    path: String,
    mimetype: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
