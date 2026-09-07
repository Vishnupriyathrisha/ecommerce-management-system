const { check, validationResult } = require("express-validator");

const validateGetData = [
  check("samplefield")
    .exists()
    .withMessage("samplefield is required")
    .not()
    .isEmpty()
    .withMessage("samplefield should not be empty"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    next();
  },
];

module.exports = validateGetData;