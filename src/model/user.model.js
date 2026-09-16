const { default: mongoose } = require("mongoose");
const { platformRating } = require("../validation/common-validation");

const userSchema = new mongoose.Schema({
    userType: {
        type: String, required: true
    },
    name: {
        type: String, required: true
    },
    email : {
        type: String, required: false
    },
    mobile: {
        type: String, required: false
    },
    address : {
        type: String, required: false
    }, 
    state : {
        type: String, required: false
    }, 
    city : {
        type: String, required: false
    }, 
    pinCode : {
        type: Number, required: false
    },
    failedLoginAttempts: { 
        type: Number, default: 0 
    },
    lockUntil: { 
        type: Date, default: null 
    },
    isActive: {
        type: Boolean, default: true
    },
    isMobileVerified: {
        type: Boolean, default: false
    },
    isPlatformRatingDone : {
        type : Boolean , default : false
    },
    googleId: {
        type: String, required: false
    },
    isGoogleSignIn : {
        type: Boolean, required: false, default: false
    },
    loginType : {
        type: String, default: ""
    },
    profile: {
        type: String, required: false
    },
    purchaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchaseSubscription"
    },
}, {
    timestamps: true,
    strict: false
});

//search index
userSchema.index({ name: 1, mobile: 1, isActive: 1 });


const User = mongoose.model("User", userSchema);
module.exports = User;