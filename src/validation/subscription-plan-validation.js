const Joi = require("joi");
const { safeTextValidation } = require("./common-validation");

//create subscription plan validation
exports.validateCreateSubscriptionPlan = Joi.object().keys({
    name: safeTextValidation,
    description: Joi.string().allow(""),
    plans: Joi.array().items(
        Joi.object({
            duration: Joi.number().valid(3, 6, 12).required(),
            price: Joi.number().min(0).required()
        })
    ).min(1).required(),    
    maxListings: Joi.number().default(0),
    featuredLimit: Joi.number().default(0),
    projectLimit: Joi.number().default(0),
    searchPriority: Joi.number().default(0),
    homepageFeatured: Joi.boolean().default(false),
    verifiedBadge: Joi.boolean().default(false),
    showcaseProperty: Joi.boolean().default(false),
    bulkUpload: Joi.boolean().default(false),
    isPlanActive: Joi.boolean().default(true)
});

//update subscription plan validation
exports.validateUpdateSubscriptionPlan = Joi.object().keys({
    id: Joi.string().required().length(24),
    name: safeTextValidation,
    description: Joi.string().allow(""),
    plans: Joi.array().items(
        Joi.object({
            duration: Joi.number().valid(3, 6, 12).required(),
            price: Joi.number().min(0).required(),
            _id: Joi.string().optional().allow(null, "")
        })
    ).min(1).required(),    
    maxListings: Joi.number().default(0),
    featuredLimit: Joi.number().default(0),
    projectLimit: Joi.number().default(0),
    searchPriority: Joi.number().default(0),
    homepageFeatured: Joi.boolean().default(false),
    verifiedBadge: Joi.boolean().default(false),
    showcaseProperty: Joi.boolean().default(false),
    bulkUpload: Joi.boolean().default(false),
    isPlanActive: Joi.boolean().default(true)
});

//purchase subscription
exports.purchaseSubscriptionValidation = Joi.object().keys({
    planId : Joi.string().required().length(24), 
    duration: Joi.number().valid(3, 6, 12).required()
});
