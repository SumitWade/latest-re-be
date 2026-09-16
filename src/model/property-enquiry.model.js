const mongoose = require("mongoose");

const propertyEnquirySchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Contacted", "Completed"],
        default: "Pending"
    }
}, {
    timestamps: true
});

const PropertyEnquiry = mongoose.model("PropertyEnquiry", propertyEnquirySchema);

module.exports = PropertyEnquiry;