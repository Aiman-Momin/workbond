const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const validateEscrowCreation = [
  body('clientWallet').isString().notEmpty().withMessage('Client wallet is required'),
  body('freelancerWallet').isString().notEmpty().withMessage('Freelancer wallet is required'),
  body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
  body('deadline').isISO8601().withMessage('Deadline must be a valid date'),
  body('gracePeriod').optional().isInt({ min: 0, max: 168 }).withMessage('Grace period must be between 0 and 168 hours'),
  body('penaltyRate').optional().isInt({ min: 0, max: 10000 }).withMessage('Penalty rate must be between 0 and 10000 basis points'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').optional().isEmail().withMessage('Email must be valid'),
  body('bio').optional().isString().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateEscrowCreation,
  validateUserUpdate
};
