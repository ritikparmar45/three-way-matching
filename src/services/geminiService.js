const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const pdf = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts text from an uploaded file (PDF or Image)
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Extracted text or base64 data
 */
async function getFileContent(file) {
  const filePath = file.path;
  const fileBuffer = fs.readFileSync(filePath);

  if (file.mimetype === 'application/pdf') {
    const data = await pdf(fileBuffer);
    return data.text;
  } else {
    // For images, we return base64 to send to Gemini as inline data
    return fileBuffer.toString('base64');
  }
}

/**
 * Parses document using Gemini API
 * @param {Object} file - Multer file object
 * @param {string} docType - po, grn, or invoice
 * @returns {Promise<Object>} - Structured JSON data
 */
async function parseDocument(file, docType) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  let prompt = '';
  const commonInstructions = `
    Extract structured JSON from this ${docType.toUpperCase()} document.
    Return ONLY valid JSON.
    Date format: YYYY-MM-DD.
    Numbers should be returned as numeric types, not strings.
    If a field is missing, return null.
  `;

  if (docType === 'po') {
    prompt = `
      ${commonInstructions}
      Required fields:
      {
        "poNumber": "string",
        "poDate": "YYYY-MM-DD",
        "vendorName": "string",
        "items": [
          {
            "sku": "string",
            "description": "string",
            "quantity": number
          }
        ]
      }
    `;
  } else if (docType === 'grn') {
    prompt = `
      ${commonInstructions}
      Required fields:
      {
        "grnNumber": "string",
        "poNumber": "string",
        "grnDate": "YYYY-MM-DD",
        "items": [
          {
            "sku": "string",
            "description": "string",
            "receivedQuantity": number
          }
        ]
      }
    `;
  } else if (docType === 'invoice') {
    prompt = `
      ${commonInstructions}
      Required fields:
      {
        "invoiceNumber": "string",
        "poNumber": "string",
        "invoiceDate": "YYYY-MM-DD",
        "items": [
          {
            "sku": "string",
            "description": "string",
            "quantity": number
          }
        ]
      }
    `;
  }

  const fileContent = await getFileContent(file);
  let result;

  if (file.mimetype === 'application/pdf') {
    // Send text extracted from PDF
    result = await model.generateContent([prompt, fileContent]);
  } else {
    // Send image data
    const imagePart = {
      inlineData: {
        data: fileContent,
        mimeType: file.mimetype
      }
    };
    result = await model.generateContent([prompt, imagePart]);
  }

  const response = await result.response;
  const text = response.text();
  
  // Clean up JSON response (Gemini sometimes wraps in markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract valid JSON from Gemini response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

module.exports = {
  parseDocument
};
