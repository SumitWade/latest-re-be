const { required } = require("joi");
const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true },
    reviewType: { type: String, required: true, },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

const Review = mongoose.model("Review", reviewSchema)
module.exports = Review;