const Joi = require('joi');

// Id validation
exports.idValidation = Joi.object().keys({
  id: Joi.string().length(24).required(),
});
exports.createUserValidation = Joi.object().keys({
  name: Joi.string().required(),
  mobile: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
  email: Joi.string().email().required(),
  userType: Joi.string(),
  password: Joi.string().min(8).max(32).required(),
  confirmPassword: Joi.string().min(8).max(32).required(),
  isActive: Joi.boolean(),
});
exports.updateUserValidation = Joi.object().keys({
  id: Joi.string().length(24).required(),
  name: Joi.string().optional(),
  mobile: Joi.string().length(10).pattern(/^[0-9]+$/).optional(),
  email: Joi.string().email().optional(),
  userType: Joi.string().optional(),
  password: Joi.string().min(8).max(32).optional(),
  setPassword: Joi.string().min(8).max(32).optional(),
  isActive: Joi.boolean().optional(),
});
//validation for reset password
exports.resetPasswordValidation = Joi.object().keys({
  userId: Joi.string().required(),
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(32).required(),
  confirmPassword: Joi.string().min(8).max(32).required()
});

// notification ids validation
exports.notificationIdsValidation = Joi.object().keys({
  notificationIds: Joi.array().min(1).items(Joi.string().length(24).required()).required(),
});


// name validation
exports.nameValidation = Joi.string()
  .custom((value, helpers) => {
    return value.trim().replace(/\s+/g, " ");  // normalize spaces
  })
  .pattern(/^[A-Za-z\s.@]+$/)
  .required()
  .messages({
    'string.pattern.base': 'Input value must contain only letters',
  });

// name and number allowed validation
exports.nameNumberValidation = Joi.string()
  .custom((value, helpers) => {
    return value.trim().replace(/\s+/g, " ");  // normalize spaces
  })
  .pattern(/^[A-Za-z0-9\s.@]+$/)
  .required()
  .messages({
    'string.pattern.base': 'Input must contain only letters and numbers',
  });

//name and number optional validation
exports.nameNumberOptionalValidation = Joi.string()
  .custom((value, helpers) => {
    return value.trim().replace(/\s+/g, " ");  // normalize spaces
  })
  .pattern(/^[A-Za-z0-9\s.@]+$/)
  .allow(null, '')
  .messages({
    'string.pattern.base': 'Input must contain only letters and numbers',
  });

//mobile number validation required
exports.mobileNumberRequiredValidation = Joi.string()
  .custom((value, helpers) => {
    return value.trim().replace(/\s+/g, " ");  // normalize spaces
  })
  .pattern(/^[0-9]{10}$/)
  .required()
  .messages({
    'string.pattern.base': 'Mobile number must be exactly 10 digits',
    'any.required': 'Mobile number is required',
  });

//mobile number optional validation
exports.mobileNumberOptionalValidation = Joi.string()
  .custom((value, helpers) => {
    return value.trim().replace(/\s+/g, " ");  // normalize spaces
  }).pattern(/^[0-9]{10}$/)
  .allow(null, '')
  .messages({
    'string.pattern.base': 'Mobile number must be exactly 10 digits',
  });

// universal name/address validation and it Disallowed characters ! $ % ^ * ? < > = { } [ ] ~ \ "`
exports.safeTextValidation = Joi.string()
  .custom((value, helpers) => {
    return value.trim().replace(/\s+/g, " ");  // normalize spaces
  })
  .pattern(/^[^!$%^*?<>=~\\"`{}[\]]+$/)
  .required()
  .messages({
    'string.pattern.base':
      "Input contains invalid characters. Only letters, numbers, spaces, and . , @ ' ( ) # / - : & are allowed.",
    'string.empty': 'This field cannot be empty',
  });

// Safe text validation (optional)
exports.safeTextOptionalValidation = Joi.string()
  .custom((value, helpers) => {
    return value.trim().replace(/\s+/g, " ");  // normalize spaces
  })
  .pattern(/^[^!$%^*?<>=~\\"`{}[\]]+$/)
  .allow(null, '')
  .messages({
    'string.pattern.base':
      "Input contains invalid characters. Only letters, numbers, spaces, and . , @ ' ( ) # / - : & are allowed.",
  });

// YouTube URL regex
const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
exports.youtubeLinkValidation = Joi.string().trim().pattern(youtubeRegex).required().messages({
  'string.pattern.base': 'Please provide a valid YouTube link.',
  'string.empty': 'YouTube link is required.',
  'any.required': 'YouTube link is required.',
});

//password validation
exports.passwordValidation = Joi.string()
  .min(12)
  .max(24)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])'))
  .required()
  .messages({
    'string.pattern.base': 'Password must include uppercase, lowercase, number and special character',
  });

//Email required validation
exports.emailRequired = Joi.string()
  .custom((value, helpers) => {
    return value.trim().replace(/\s+/g, " ");  // normalize spaces
  })
  .email({ tlds: { allow: false } }) // tlds = Top Level Domain   Ex: gmail.com, yahoo.com, outlook.com
  .lowercase()
  .required()
  .messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required',
  });

//email optional validation
exports.emailOptional = Joi.string()
  .custom((value, helpers) => {
    return value.trim().replace(/\s+/g, " ");  // normalize spaces
  })
  .email({ tlds: { allow: false } }) // tlds = Top Level Domain   Ex: gmail.com, yahoo.com, outlook.com
  .lowercase()
  .allow('', null)
  .optional()
  .messages({
    'string.email': 'Please enter a valid email address',
  });

//pin code validation
exports.pinCodeValidation = Joi.string()
  .pattern(/^[1-9][0-9]{5}$/)
  .required()
  .messages({
    "any.required": "PIN code is required",
    "string.empty": "PIN code is required",
    "string.pattern.base": "PIN code must be a valid 6-digit Indian PIN code"
  });


//Input number validation
exports.inputNumberValidation = Joi.number()
  .min(0)
  .required()
  .messages({
    "number.base": "Value must be a number",
    "number.min": "Value cannot be negative",
    "any.required": "Value is required"
  });

// Input number optional validation
exports.inputNumberOptionalValidation = Joi.number()
  .min(0).optional().allow(null)
  .messages({
    "number.base": "Value must be a number",
    "number.min": "Value cannot be negative"
  });

exports.addContactValidation = Joi.object().keys({
  name: Joi.string().required(),
  phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
  email: Joi.string().email().required(),
  message: Joi.string().required()
});

exports.platformRating = Joi.object().keys({
 rating : Joi.number().required(),
 suggestion : Joi.string().optional("",null),
})
