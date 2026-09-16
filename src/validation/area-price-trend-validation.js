const Joi = require("joi");
const { nameValidation, inputNumberValidation } = require("./common-validation");

//validation for add area trend
exports.addAreaPriceTrendValidationSchema = Joi.object().keys({
    city: nameValidation,
    area: nameValidation,
    priceTrends: Joi.array().items(
        Joi.object({
            price: inputNumberValidation,
            year: inputNumberValidation,
            month: nameValidation,
            monthValue: inputNumberValidation
        })
    )
});

//validation for update area trend
exports.updateAreaPriceTrendValidationSchema = Joi.object().keys({
    priceTrendId: Joi.string().length(24).required(),
    city: nameValidation,
    area: nameValidation,
    priceTrends: Joi.array().items(
        Joi.object({
            price: inputNumberValidation,
            year: inputNumberValidation,
            month: nameValidation,
            monthValue: inputNumberValidation
        })
    )
});