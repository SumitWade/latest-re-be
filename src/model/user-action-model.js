const mongoose = require("mongoose");

const userActionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    dateString: {
        type: String, // e.g. 'YYYY-MM-DD'
        required: true
    },
    actions: [{
        actionType: {
            type: String,
            required: true,
            enum: ['PLATFORM_REVIEW', 'REVIEW', 'WISHLIST_PROPERTY', 'ENQUIRY_ON_PROPERTY', 'ENQUIRY_ON_PROJECT', 'OTHER']
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: false
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: false
        },
        action: {
            type: String,
            required: true
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            required: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    strict: false
});

const UserAction = mongoose.model("UserAction", userActionSchema)
module.exports = UserAction 