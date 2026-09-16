const Joi = require("joi");
const { safeTextValidation, safeTextOptionalValidation, pinCodeValidation, inputNumberValidation, nameValidation } = require("./common-validation");

//validation for add project
exports.addProjectValidationSchema = Joi.object({
    name : safeTextValidation,
    reraNumber: safeTextOptionalValidation,
    projectType: Joi.string().required()
        .valid("Residential", "Commercial", "Industrial", "Mixed Use", "Township", "Plotted Development", "Villa Project", "Farmhouse"),
    constructionStatus: Joi.string().required()
        .valid("Planned", "Under Construction", "Ready to Move", "Completed", "Ongoing", "Upcoming"),
    vastuCompliance : Joi.array().items(Joi.string().trim()).optional().allow(null),
    totalTower: inputNumberValidation,
    totalUnit : inputNumberValidation,
    address : safeTextOptionalValidation,
    city: nameValidation,
    state: nameValidation,
    zipCode : pinCodeValidation,
    locality : safeTextOptionalValidation,    //landmark
    latitude : inputNumberValidation,
    longitude: inputNumberValidation,
    startDate : Joi.date().required(),
    possessionDate : Joi.date().required(),
    description : safeTextOptionalValidation,
    amenities : Joi.array().items(Joi.string().required().trim()).min(1).required(),
    isVastuDone: Joi.boolean().required(),
    // new key 
    currentNearLocation: Joi.array().optional().allow(null),
});


//validation for update project
exports.updateProjectValidationSchema = Joi.object().keys({
    projectId: Joi.string().length(24).required(),
    name : safeTextValidation,
    reraNumber: safeTextOptionalValidation,
    projectType: Joi.string().required()
        .valid("Residential", "Commercial", "Industrial", "Mixed Use", "Township", "Plotted Development", "Villa Project", "Farmhouse"),
    constructionStatus: Joi.string().required()
        .valid("Planned", "Under Construction", "Ready to Move", "Completed", "Ongoing", "Upcoming"),
    vastuCompliance : Joi.array().items(Joi.string().trim()).optional().allow(null),
    totalTower: inputNumberValidation,
    totalUnit : inputNumberValidation,
    address : safeTextOptionalValidation,
    city: nameValidation,
    state: nameValidation,
    zipCode : pinCodeValidation,
    locality : safeTextOptionalValidation,    //landmark
    latitude : inputNumberValidation,
    longitude: inputNumberValidation,
    startDate : Joi.date().required(),
    possessionDate : Joi.date().required(),
    description : safeTextOptionalValidation,
    amenities : Joi.array().items(Joi.string().required().trim()).min(1).required(),
    isVastuDone: Joi.boolean().required(),
    currentNearLocation: Joi.array().optional().allow(null),
});