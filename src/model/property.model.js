const { required } = require('joi');
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    // Property Details
    propertyType: { type: String, required: true, default: "" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    propertyCategory: { type: String, required: true, default: "" },

    // Residential
    residentialPropertyType: { type: String, default: "" },
    bhkType: { type: String, default: "" },
    propertyCondition: { type: String, default: "" },
    loanAvailability: { type: String, default: "" },
    flooringType: { type: String, default: "" },
    gatedCommunity: { type: String, default: "" },
    additionalRooms: { type: [String], default: [] },

    // Commercial
    commercialPropertyType: { type: String, default: "" },
    idealFor: { type: Array, default: [] },
    washrooms: { type: String, default: "" },
    powerBackup: { type: String, default: "" },
    loadUnloadArea: { type: String, default: "" },
    ceilingHeight: { type: Number, default: null },
    cabinWorkStation: { type: Number, default: null },
    electricityLoad: { type: Number, default: null },
    fireNoc: { type: String, default: "" },

    // Land / Plot
    landPlotPropertyType: { type: String, default: null },
    plotArea: { type: Number, default: null },
    unit: { type: String, default: "" },
    fencing: { type: String, default: "" },
    legalClear: { type: String, default: "" },
    boundaryWall: { type: String, default: "" },
    roadWidth: { type: Number, default: null },

    // Property Information
    propertyTitle: { type: String, required: true, default: "" },
    description: { type: String, required: true, default: "" },
    listingType: { type: String, required: true, default: "" },
    vastuCompliance: { type: [String], default: [] },

    state: { type: String, required: true, default: "" },
    city: { type: String, required: true, default: "" },
    locality: { type: String, default: "" },
    landmark: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: "" },
    googleMapLink: { type: String, default: "" },

    // Price Details
    price: { type: Number, required: true, default: null },
    priceIn: { type: String, required: true, default: "" },
    pricePerSqft: { type: Number, default: null },
    priceNegotiable: { type: String, default: "" },
    securityDeposit: { type: Number, default: null },
    maintenanceCharges: { type: Number, default: null },
    ownershipType: { type: String, default: "" },

    // Property Overview
    buildUpArea: { type: Number, default: null },
    transactionType: { type: String, default: "" },
    carpetArea: { type: Number, default: null },
    propertyArea: { type: Number, default: null },
    ageOfProperty: { type: Number, default: null },
    totalTower: { type: Number, default: null },
    propertyFloorNo: { type: Number, default: null },
    facingDirection: { type: String, default: "" },
    furnishing: { type: String, default: "" },
    bedrooms: { type: Number, default: null },
    bathrooms: { type: Number, default: null },
    balcony: { type: Number, default: null },
    carParking: { type: Number, default: null },
    commercialParking: { type: Number, default: null },
    waterSupply: { type: String, default: "" },

    // Owner Details
    owner: { type: String, default: "" },
    mobile: { type: String, required: true, default: "" },
    email: { type: String, default: "" },

    isActive: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    floorPlans: { type: String, required: false, default: "" },
    brochure: { type: String, required: false, default: "" },
    gallery: { type: Array, required: false, default: [] },
    virtualTour: { type: Array, required: false, default: [] },
    threeSixtyView: { type: Array, required: false, default: [] },
    allUploadedFiles: { type: Array, required: false, default: [] },
    status: {
        type: String,
        enum: ["pending", "recheck", "approved", "new"],
        default: "new"
    },
    amenities: { type: Array, required: false, default: [] },
    adminRemarks: { type: String, default: "" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviews: { type: Number, default: 0 },
    // mark property as a hot selling by admin
    isHotsellingProperty: { type: Boolean, default: false },
    purchasedId:  { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseSubscription", default: null },
    isTrending: { type: Boolean, default: false },
    showcaseProperty: { type: Boolean, default: false },
    verifiedBadge: { type: Boolean, default: false },
    homepageFeatured: { type: Boolean, default: false },
    isPropertyFeatured: { type: Boolean, default: false },
    searchPriority: { type: Number, default: 0 }
}, {
    timestamps: true
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;

