const mongoose = require("mongoose");

const propertyUpdateRequestSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userName: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "approved", "recheck"],
        default: "pending"
    },
    // Latest draft
    propertyData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    // Approved property when request was first created
    propertySnapshot: {
        type: mongoose.Schema.Types.Mixed,
        default: null
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
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    adminRemarks: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});


const propertyUpdateRequest = mongoose.model("propertyUpdateRequest", propertyUpdateRequestSchema);
module.exports = propertyUpdateRequest;