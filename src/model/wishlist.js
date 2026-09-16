const mongoose = require("mongoose")

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        default: null
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Project",
        default: null
        
    },
    isLiked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Wishlist = mongoose.model("Wishlist", wishlistSchema)
module.exports = Wishlist
