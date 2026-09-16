const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");
const sendEmail = require("../../utils/helper/send-mail");
const { generateOtpValidation } = require("../../validation/user-validation");

const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days

// Generate OTP for mobile
const sendOTPForMobileVerification = async (request, response) => {
    try {
        //Extract data from the request body
        const {id, mobile } = request.body;

        // Validate
        const { value, error } = await generateOtpValidation.validate({ mobile }, { abortEarly: true });
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        //check if the user exist or not
        const isRecordExist = await userServices.getUserByObjectId(id);
        if(!isRecordExist){
            return response.notFound("User record not found")
        };

        // //check whether the user is active
        // if (user.isActive == "false") {
        //     return response.badRequest("Account is currently inactive contact to admin")
        // }

        const maskedMobile = "*".repeat(value.mobile.length - 4) + value.mobile.slice(-4);

        // Check if OTP already exists and still valid (rate limiting)
        const isOtpValid = await userServices.isOtpStillValid(mobile);
        if (isOtpValid) {
            return response.badRequest(`OTP already sent on (${maskedMobile}). Please wait before requesting again.`)
        }

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000);
        const dataToSend = { mobile, otp };

        // Save OTP in DB
        const isOtpSaved = await userServices.saveOtp(dataToSend);
        if (isOtpSaved) {
            await userServices.updateUser(id, {isMobileVerified : false});
            const msg = `OTP sent to registered mobile (${maskedMobile}) and OTP-${otp} `
            return response.success(msg, otp)
        } else {
            return response.badRequest("Failed to send OTP.")
        }
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'sendOTPForMobileVerification',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = sendOTPForMobileVerification;
