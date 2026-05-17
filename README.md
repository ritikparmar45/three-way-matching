# Three-Way Match Engine for PO, GRN, and Invoice

A production-style backend system built with Node.js, Express, and MongoDB that automates the verification process between Purchase Orders (PO), Goods Receipt Notes (GRN), and Invoices using Google Gemini AI for document parsing.

## 🚀 Project Overview
This system implements a "Three-Way Match" process, which is a common accounting practice to ensure that:
1. What was ordered (**PO**) matches what was received (**GRN**).
2. What was received (**GRN**) matches what was billed (**Invoice**).
3. What was billed (**Invoice**) matches what was ordered (**PO**).

The system uses Gemini AI to extract structured data from PDF and image uploads, allowing for high flexibility in document formats.

## 🏗️ Architecture
- **Tech Stack**: Node.js, Express.js, MongoDB (Mongoose), Google Gemini AI, Multer.
- **AI Integration**: Uses `gemini-2.5-flash` for high-speed, accurate document parsing and JSON extraction.
- **Matching Engine**: A modular service that recalculates match status every time a new document is uploaded, supporting out-of-order document arrival.

## 📁 Folder Structure
```text
backend/
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middlewares (upload, error, validation)
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic (Gemini AI, Matching Engine)
│   ├── utils/              # Helper functions
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── uploads/                # Local storage for uploaded documents
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
└── README.md               # Documentation
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas)
- Google Gemini API Key ([Get it here](https://aistudio.google.com/))

### Installation
1. Clone the repository.
2. Navigate to the `backend` directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/three_way_match
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

## 📡 API Documentation
The API is documented using Swagger. Once the server is running, visit:
`http://localhost:5000/api-docs`

### Key Endpoints
- **POST `/api/documents/upload`**: Upload a file (PDF/Image) and specify `documentType` (`po`, `grn`, or `invoice`).
- **GET `/api/match/:poNumber`**: Retrieve the matching results and details for a specific PO.
- **GET `/api/documents/:id?type=po`**: Retrieve details of a specific parsed document.

## 🧠 Matching Logic & Rules
The engine performs validation at the **item level (SKU)**.

### Rules:
1. **GRN Quantity** must not exceed **PO Quantity**.
2. **Invoice Quantity** must not exceed total **GRN Quantity**.
3. **Invoice Quantity** must not exceed **PO Quantity**.
4. **Invoice Date** must not be after **PO Date**.
5. All items in GRN/Invoice must exist in the PO.

### Status Values:
- `matched`: All documents are present and quantities match exactly.
- `partially_matched`: No mismatches found, but some documents are still pending or quantities are under-fulfilled.
- `mismatch`: One or more validation rules failed.
- `insufficient_documents`: Missing Purchase Order or related documents.

## 🔄 Out-of-Order Upload Handling
Documents can be uploaded in any order (e.g., Invoice before PO). 
- If an Invoice arrives first, the system saves it and marks the match status as `insufficient_documents`.
- When the PO is finally uploaded, the `matchingService` is triggered, finds the existing Invoice, and updates the `MatchResult` accordingly.

## 📝 Assumptions & Tradeoffs
- **SKU Uniqueness**: It is assumed that SKU/itemCode is unique within a single PO.
- **Document Quality**: Gemini AI's accuracy depends on the legibility of the uploaded documents.
- **Single Currency**: The current version assumes all documents use the same currency.

## 🚀 Future Improvements
- Multi-currency support.
- User authentication and RBAC.
- Webhook notifications for mismatches.
- Integration with ERP systems like SAP or Oracle.
