const Joi = require('joi');

exports.addPropertyEnquiryValidation = Joi.object().keys({
    propertyId: Joi.string().length(24).required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    message: Joi.string().required()
});
exports.addProjectEnquiryValidation = Joi.object().keys({
    projectId: Joi.string().length(24).required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    message: Joi.string().required()
});
