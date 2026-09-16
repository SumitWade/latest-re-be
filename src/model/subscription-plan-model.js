const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    plans: [
        {
            duration: {
                type: Number,
                enum: [3, 6, 12],
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            _id: 0
        }
    ],
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
    homepageFeatured: {
        type: Boolean,
        default: false
    },
    verifiedBadge: {
        type: Boolean,
        default: false
    },
    showcaseProperty: {
        type: Boolean,
        default: false
    },
    bulkUpload: {
        type: Boolean,
        default: false
    },
    isPlanActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
module.exports = SubscriptionPlan;