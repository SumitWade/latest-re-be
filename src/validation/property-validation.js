const Joi = require('joi');
const { safeTextValidation, safeTextOptionalValidation, pinCodeValidation, inputNumberValidation, nameValidation, mobileNumberRequiredValidation, emailOptional, inputNumberOptionalValidation } = require("./common-validation");

// property add validation schema
exports.addPropertyValidationSchema = Joi.object().keys({
    // property details section
    propertyType: Joi.string().required().valid("individual", "project"),
    projectId: Joi.when("propertyType", {
        is: "project",
        then: Joi.string().length(24).required(),
        otherwise: Joi.string().length(24).optional().allow(null, "")
    }),
    propertyCategory: Joi.string()
        .required()
        .valid("Residential", "Commercial", "Land/Plot")
        .messages({
            "any.only": "Property category must be Residential, Commercial or Land/Plot",
            "any.required": "Property category is required"
        }),
    //Residential category
    residentialPropertyType: Joi.when("propertyCategory", {
        is: "Residential",
        then: safeTextValidation,
        otherwise: Joi.string().optional().allow(null, "")
    }),
    bhkType: Joi.when("propertyCategory", {
        is: "Residential",
        then: safeTextValidation,
        otherwise: Joi.string().optional().allow(null, "")
    }),
    propertyCondition: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.string().required().valid("Under Construction", "Ready To Move", "Upcoming"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    loanAvailability: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    flooringType: Joi.when("propertyCategory", {
        is: "Residential",
        then: safeTextValidation,
        otherwise: Joi.string().optional().allow(null, "")
    }),
    gatedCommunity: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    additionalRooms: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.array().items(Joi.string().valid("Pooja Room", "Study Room", "Servant Room", "Store Room", "Guest Room")).min(1).required(),
        otherwise: Joi.array().optional().allow(null)
    }),

    //Commercial category
    commercialPropertyType: Joi.when("propertyCategory", {
        is: "Commercial",
        then: safeTextValidation,
        otherwise: Joi.string().optional().allow(null, "")
    }),
    idealFor: Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.array().items(Joi.string()).min(1).required(),
        otherwise: Joi.array().items(Joi.string()).optional().allow(null, "")
    }),
    washrooms: Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.string().required().valid("Shared", "Private", "Both"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    powerBackup: Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    loadUnloadArea: Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    ceilingHeight: Joi.when("propertyCategory", {
        is: "Commercial",
        then: inputNumberValidation,
        otherwise: Joi.number().optional().allow(null, "")
    }),
    cabinWorkStation: Joi.when("propertyCategory", {
        is: "Commercial",
        then: inputNumberValidation,
        otherwise: Joi.number().optional().allow(null, "")
    }),
    fireNoc : Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    electricityLoad: Joi.when("propertyCategory", {
        is: "Commercial",
        then: inputNumberValidation,
        otherwise: Joi.number().optional().allow(null, "")
    }),
    commercialParking: Joi.when("propertyCategory", {
        is: "Commercial",
        then: inputNumberOptionalValidation,
        otherwise: Joi.number().optional().allow(null, "")
    }),

    //Land/Plot category
    landPlotPropertyType: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    plotArea: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.number().required(),
        otherwise: Joi.number().optional().allow(null)
    }),
    unit: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    gatedCommunity: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    fencing: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    legalClear: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    boundaryWall: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    roadWidth: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: inputNumberValidation,
        otherwise: Joi.number().optional().allow(null, "")
    }),

    propertyTitle: safeTextValidation,
    description: safeTextValidation,
    listingType: Joi.string().required().valid("Buy", "Rent", "Sale"),    // buy, rent , lease
    vastuCompliance: Joi.array().items(Joi.string()).min(0).optional().allow(null, ""),
    state: nameValidation,
    city: nameValidation,
    locality: safeTextValidation,
    landmark: safeTextOptionalValidation,
    googleMapLink: safeTextValidation,
    zipCode: pinCodeValidation,
    latitude: inputNumberValidation,
    longitude: inputNumberValidation,
    address: safeTextOptionalValidation,

    // price section details
    price: inputNumberValidation,
    priceIn: Joi.string().required(),
    pricePerSqft: inputNumberValidation,
    priceNegotiable: Joi.string().optional().allow(null, "").valid("Yes", "No"),
    securityDeposit: Joi.number().optional().allow(null, ""),
    maintenanceCharges: Joi.number().optional().allow(null, ""),
    ownershipType: Joi.string().optional().allow(null, "").valid("Freehold", "Leasehold", "Power of Attorney","Co-operative Society"),

    //property overview details
    buildUpArea: inputNumberValidation,
    transactionType: Joi.string().optional().allow(null, "").valid("New", "Resale"),
    carpetArea: inputNumberOptionalValidation,
    propertyArea: inputNumberValidation,
    ageOfProperty: inputNumberOptionalValidation,
    totalTower: inputNumberOptionalValidation,
    propertyFloorNo: inputNumberOptionalValidation,
    facingDirection: safeTextOptionalValidation,
    furnishing: Joi.string().optional().allow(null, "").valid("unfurnished", "Semi-Furnished", "Fully-Furnished"),
    bedrooms: inputNumberOptionalValidation,
    bathrooms: inputNumberOptionalValidation,
    balcony: inputNumberOptionalValidation,
    carParking: inputNumberOptionalValidation,
    waterSupply: Joi.string().optional().allow(null, "").valid("Municipal", "Borewell", "Both"),

    //owner details
    owner: safeTextOptionalValidation,
    mobile: mobileNumberRequiredValidation,
    email: emailOptional,
    amenities: Joi.array().items(Joi.string().allow(null, "")).optional()
});

//validation for update individual property
exports.updatePropertyValidationSchema = Joi.object().keys({
    propertyId: Joi.string().length(24).required(),
    // property details section
    propertyType: Joi.string().required().valid("individual", "project"),
    projectId: Joi.when("propertyType", {
        is: "project",
        then: Joi.string().length(24).required(),
        otherwise: Joi.string().length(24).optional().allow(null, "")
    }),
    propertyCategory: Joi.string()
        .required()
        .valid("Residential", "Commercial", "Land/Plot")
        .messages({
            "any.only": "Property category must be Residential, Commercial or Land/Plot",
            "any.required": "Property category is required"
        }),
    //Residential category
    residentialPropertyType: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    bhkType: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    propertyCondition: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.string().required().valid("Under Construction", "Ready To Move", "Upcoming"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    loanAvailability: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    flooringType: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    gatedCommunity: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    additionalRooms: Joi.when("propertyCategory", {
        is: "Residential",
        then: Joi.array().items(Joi.string().valid("Pooja Room", "Study Room", "Servant Room", "Store Room", "Guest Room")).min(1).required(),
        otherwise: Joi.array().optional().allow(null, "")
    }),

    //Commercial category
    commercialPropertyType: Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    idealFor: Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.array().items(Joi.string()).min(1).required(),
        otherwise: Joi.array().items(Joi.string()).optional().allow(null)
    }),
    washrooms: Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.string().required().valid("Shared", "Private", "Both"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    powerBackup: Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    loadUnloadArea: Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    ceilingHeight: Joi.when("propertyCategory", {
        is: "Commercial",
        then: inputNumberValidation,
        otherwise: Joi.number().optional().allow(null, "")
    }),
    cabinWorkStation: Joi.when("propertyCategory", {
        is: "Commercial",
        then: inputNumberValidation,
        otherwise: Joi.number().optional().allow(null, "")
    }),
    fireNoc : Joi.when("propertyCategory", {
        is: "Commercial",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    electricityLoad: Joi.when("propertyCategory", {
        is: "Commercial",
        then: inputNumberValidation,
        otherwise: Joi.number().optional().allow(null, "")
    }),
    commercialParking: Joi.when("propertyCategory", {
        is: "Commercial",
        then: inputNumberOptionalValidation,
        otherwise: Joi.number().optional().allow(null, "")
    }),


    //Land/Plot category
    landPlotPropertyType: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    plotArea: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.number().required(),
        otherwise: Joi.number().optional().allow(null, "")
    }),
    unit: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    gatedCommunity: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    fencing: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    legalClear: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    boundaryWall: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: Joi.string().required().valid("Yes", "No"),
        otherwise: Joi.string().optional().allow(null, "")
    }),
    roadWidth: Joi.when("propertyCategory", {
        is: "Land/Plot",
        then: inputNumberValidation,
        otherwise: Joi.number().optional().allow(null, "")
    }),

    propertyTitle: Joi.string().required(),
    description: Joi.string().required(),
    listingType: Joi.string().required().valid("Buy", "Rent", "Sale"),    // buy, rent , lease
    vastuCompliance: Joi.array().items(Joi.string()).min(0).optional().allow(null, ""),
    state: nameValidation,
    city: nameValidation,
    locality: safeTextValidation,
    landmark: safeTextOptionalValidation,
    googleMapLink: safeTextValidation,
    zipCode: pinCodeValidation,
    latitude: inputNumberValidation,
    longitude: inputNumberValidation,
    address: safeTextOptionalValidation,

    // price section details
    price: inputNumberValidation,
    priceIn: Joi.string().required(),
    pricePerSqft: inputNumberValidation,
    priceNegotiable: Joi.string().optional().allow(null, "").valid("Yes", "No"),
    securityDeposit: Joi.number().optional().allow(null, ""),
    maintenanceCharges: Joi.number().optional().allow(null, ""),
    ownershipType: Joi.string().optional().allow(null, "").valid("Freehold", "Leasehold", "Power of Attorney"),

    //property overview details
    buildUpArea: inputNumberValidation,
    transactionType: Joi.string().optional().allow(null, "").valid("New", "Resale"),
    carpetArea: inputNumberOptionalValidation,
    propertyArea: inputNumberValidation,
    ageOfProperty: inputNumberOptionalValidation,
    totalTower: inputNumberOptionalValidation,
    propertyFloorNo: inputNumberOptionalValidation,
    facingDirection: safeTextOptionalValidation,
    furnishing: Joi.string().optional().allow(null, "").valid("unfurnished", "Semi-Furnished", "Fully-Furnished"),
    bedrooms: inputNumberOptionalValidation,
    bathrooms: inputNumberOptionalValidation,
    balcony: inputNumberOptionalValidation,
    carParking: inputNumberOptionalValidation,
    waterSupply: Joi.string().optional().allow(null, "").valid("Municipal", "Borewell", "Both"),

    //owner details
    owner: safeTextOptionalValidation,
    mobile: mobileNumberRequiredValidation,
    email: emailOptional,
    amenities: Joi.array().items(Joi.string().allow(null, "")).optional()}),
exports.enquiryStatusValidationSchema = Joi.object().keys({
    id: Joi.string().length(24).required(),
    status: Joi.string().required().valid("Pending", "Contacted", "Completed"),
});
