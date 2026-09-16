const Joi = require('joi');
const { nameValidation, emailOptional, mobileNumberRequiredValidation, safeTextOptionalValidation, pinCodeValidation, emailRequired, safeTextValidation } = require('./common-validation');

exports.userRegistrationValidation = Joi.object().keys({
    type: Joi.string().required().valid("developer", "agent", "owner", "visitor", "admin"),
    name : nameValidation,
    email : Joi.when("type", {
        is: "visitor",
        then: emailRequired,
        otherwise: emailOptional
    }),    
    mobile: mobileNumberRequiredValidation
})

exports.userDetailUpdateValidation = Joi.object().keys({
    id: Joi.string().length(24).required(),
    name : nameValidation,
    email : emailRequired,
    mobile: mobileNumberRequiredValidation,
    address : safeTextValidation, 
    state : nameValidation, 
    city : nameValidation, 
    pinCode: pinCodeValidation
})

//generate otp
exports.generateOtpValidation = Joi.object().keys({
    mobile: mobileNumberRequiredValidation
});

//verify otp
exports.verifyOtpValidation = Joi.object().keys({
    otp: Joi.string().required(),
    emailOtp: Joi.string().optional().allow(null, ""),
    mobile: mobileNumberRequiredValidation,
});

//verify otp
exports.verifyOtpForMobile = Joi.object().keys({
    otp: Joi.string().required(),
    mobile: mobileNumberRequiredValidation,
})