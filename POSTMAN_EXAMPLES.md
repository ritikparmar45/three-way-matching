# Postman Collection Examples

## 1. Upload Purchase Order
**POST** `{{base_url}}/api/documents/upload`

**Body (form-data):**
- `file`: [PO_Document.pdf]
- `documentType`: `po`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2024-001",
    "poDate": "2024-05-10T00:00:00.000Z",
    "vendorName": "TechCorp Solutions",
    "items": [
      { "sku": "LAP-001", "description": "High-end Laptop", "quantity": 10 },
      { "sku": "MON-002", "description": "4K Monitor", "quantity": 20 }
    ],
    "_id": "66432..."
  },
  "message": "PO processed and matched successfully"
}
```

## 2. Upload GRN (Goods Receipt Note)
**POST** `{{base_url}}/api/documents/upload`

**Body (form-data):**
- `file`: [GRN_Photo.jpg]
- `documentType`: `grn`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "grnNumber": "GRN-9982",
    "poNumber": "PO-2024-001",
    "items": [
      { "sku": "LAP-001", "receivedQuantity": 10 },
      { "sku": "MON-002", "receivedQuantity": 15 }
    ]
  }
}
```

## 3. Get Match Result
**GET** `{{base_url}}/api/match/PO-2024-001`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2024-001",
    "status": "partially_matched",
    "mismatchReasons": [],
    "itemLevelResults": [
      {
        "sku": "LAP-001",
        "poQty": 10,
        "grnQty": 10,
        "invoiceQty": 0,
        "status": "partially_matched"
      },
      {
        "sku": "MON-002",
        "poQty": 20,
        "grnQty": 15,
        "invoiceQty": 0,
        "status": "partially_matched"
      }
    ]
  }
}
```

## 4. Mismatch Example (Invoice exceeds GRN)
If an invoice is uploaded with 12 Laptops but only 10 were received in GRN:

**GET** `{{base_url}}/api/match/PO-2024-001`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "mismatch",
    "mismatchReasons": ["invoice_qty_exceeds_grn_qty"],
    "itemLevelResults": [
      {
        "sku": "LAP-001",
        "poQty": 10,
        "grnQty": 10,
        "invoiceQty": 12,
        "status": "mismatch",
        "reasons": ["invoice_qty_exceeds_grn_qty", "invoice_qty_exceeds_po_qty"]
      }
    ]
  }
}
```
