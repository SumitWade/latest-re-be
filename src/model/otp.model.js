const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: false,
    },
    otp: {
        type: String,
        required: true,
    },
    expireAt: {
        type: Date,
        default: Date.now,
        // The 'expires' option sets the TTL index on the 'expirationDate' field.
        expires: 120, // Time in seconds for expiration (e.g., 120 seconds = 2 minutes).
    },
});

const OtpModel = mongoose.model('Otp', otpSchema);
module.exports = OtpModel;