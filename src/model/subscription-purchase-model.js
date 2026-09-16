const { required } = require('joi');
const mongoose = require('mongoose');

const purchaseSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubscriptionPlan"
    },
    duration: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Active", "Expired"]
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"]
    },
    maxListings: {
        type: Number,
        default: 0
    },
    featuredLimit: {
        type: Number,
        default: 0
    },
    projectLimit: {
        type: Number,
        default: 0
    },
    searchPriority: {
        type: Number,
        default: 0
    },
    isPurchaseActive : {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    strict: false
});

const PurchaseSubscription = mongoose.model("PurchaseSubscription", purchaseSubscriptionSchema);
module.exports = PurchaseSubscription