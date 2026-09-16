const userServices = require("../../services/user.service");
const generateUserJWT = require("../../middlewares/generate.token");
const { verifyOtpValidation } = require("../../validation/user-validation");
const logError = require("../../utils/helper/pino-log-error");

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const visitorLogin = async (request, response) => {
    try {
        const { otp, mobile } = request.body;
        // Validate input
        const {value, error} = verifyOtpValidation.validate({ otp: otp?.toString(), mobile: mobile?.toString()}, { abortEarly: true });
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        // Check user
        const user = await userServices.isUserExistWithMobile(value.mobile);
        if (!user) {
            return response.notFound("Mobile number is not registered.")
        }

        //Check account lock
        if (user.lockUntil && Date.now() < user.lockUntil) {
            const remainingSeconds = Math.ceil((user.lockUntil - Date.now()) / 1000);
            return response.badRequest(`Account is locked. Try again in ${remainingSeconds} seconds.`)
        }

        // Auto unlock if expired
        if (user.lockUntil && Date.now() >= user.lockUntil) {
            await userServices.updateUser(user._id, {
                failedLoginAttempts: 0,
                lockUntil: null
            });
        }

        // Verify OTP
        const isOtpCorrect = await userServices.verifyOtp(mobile, otp);
        if (!isOtpCorrect) {
            let attempts = (user.failedLoginAttempts || 0) + 1;
            let updates = { failedLoginAttempts: attempts };

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                updates.lockUntil = Date.now() + LOCK_TIME;
            }

            await userServices.updateUser(user._id, updates);
            const remaining = Math.max(MAX_FAILED_ATTEMPTS - attempts, 0);

            const msg =  remaining > 0
                    ? `Incorrect OTP! ${remaining} attempts left.`
                    : "Account locked for 15 minutes due to multiple failed attempts."
            return response.badRequest(msg)
        }

        // Delete OTP after success
        await userServices.deleteOtpOnLogin(mobile);

        // Update login session
        await userServices.updateUser(user._id, {
            isLogIn: true,
            lastLoginAt: new Date(),
            failedLoginAttempts: 0,
            lockUntil: null
        });

        //details to send while generate token
        const userDetails = {
            _id: user._id,
            name: user.name,
            mobile: user.mobile,
            email: user.email,
            isActive: user.isActive,
            userType: user.userType
        };
        const token = generateUserJWT(userDetails);

        return response.status(200).json({
            status: "SUCCESS",
            message: "Login Successfully",
            token,
            userDetails
        });

    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'visitorLogin',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = visitorLogin;