const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    reraNumber: { type: String, required: true },
    projectType: { type: String, required: true },
    constructionStatus: { type: String, required: true },
    vastuCompliance: { type: Array, required: false, default: [] },
    totalTower: { type: Number, required: true },
    totalUnit: { type: Number, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, default: "" },
    state: { type: String, required: true, default: "" },
    state: { type: String, required: false, default: "" },
    locality: { type: String, required: true, default: "" },
    zipCode: { type: String, required: false, default: "" },

    developerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    latitude: {
        type: Number,
        require: false
    },
    longitude: {
        type: Number,
        require: false
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],  // 'Point' is the only valid value for GeoJSON type
            required: false
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    startDate: { type: Date },
    possessionDate: { type: Date },
    description: { type: String, required: false, default: "" },
    floorPlans: { type: String, required: false, default: "" },
    brochure: { type: String, required: false, default: "" },
    gallery: { type: Array, required: false, default: [] },
    virtualTour: { type: Array, required: false, default: [] },
    threeSixtyView: { type: Array, required: false, default: [] },
    allUploadedFiles: { type: Array, required: false, default: [] },
    amenities: { type: Array, required: true, default: [] },
    developerName: { type: String },

    completionDate: { type: Date },
    isActive: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    rankedDate: { type: Date },
    isDeleted: { type: Boolean, default: false },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    featured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    remark: { type: String, default: "" },

    approvedByAdmin: { type: Boolean, default: false },
    showToPublic: { type: Boolean, default: false },
    hotSelling: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["pending", "recheck", "approved", "new"],
        default: "new"
    },
    adminRemarks: {
        type: String,
        default: ""
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    reviewHistory: [
        {
            status: String,
            remarks: String,
            actionBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            actionAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    isVastuDone: {
        type: Boolean, required: false, default: false
    },
    isVerified: {
        type: Boolean, required: false, default: false
    },
    // new key 
    currentNearLocation: { type: Array, required: false, default: [] },
    showcaseProperty: { type: Boolean, default: false },
    verifiedBadge: { type: Boolean, default: false },
    homepageFeatured: { type: Boolean, default: false },
    searchPriority: { type: Number, default: 0 }
},
    { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;