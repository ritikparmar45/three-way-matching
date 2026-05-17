const { body, validationResult } = require('express-validator');

exports.validateUpload = [
  body('documentType')
    .isIn(['po', 'grn', 'invoice'])
    .withMessage('Document type must be po, grn, or invoice'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
