const userServices = require("../../services/user.service");
const generateUserJWT = require("../../middlewares/generate.token");
const { verifyOtpForMobile } = require("../../validation/user-validation");
const logError = require("../../utils/helper/pino-log-error");

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const verifyMobile = async (request, response) => {
    try {
        const {id, otp, mobile } = request.body;
        // Validate input
        const { value, error } = verifyOtpForMobile.validate({ otp: otp?.toString(), mobile: mobile?.toString() }, { abortEarly: true });
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

        // Verify OTP
        const isOtpCorrect = await userServices.verifyOtp(mobile, otp);
        if (isOtpCorrect) {
            await userServices.updateUser(id, {isMobileVerified : true});
            // Delete OTP after success
            await userServices.deleteOtpOnLogin(mobile);
            return response.ok("Mobile verified successfully.")
        }else {
            return response.badRequest("Failed to verify mobile")
        }

    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'verifyMobile',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = verifyMobile;