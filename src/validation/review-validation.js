const Joi = require('joi');

exports.addReviewValidation = Joi.object().keys({
    projectId: Joi.string().length(24).optional().default(null),
    propertyId: Joi.string().length(24).optional().default(null),
    reviewType: Joi.string().required().valid("property", "project", "platform"),
    title: Joi.string().required(),
    description: Joi.string().required(),
    rating: Joi.number().required()
});