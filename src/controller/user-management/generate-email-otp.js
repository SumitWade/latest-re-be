const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");
const sendEmail = require("../../utils/helper/send-mail");
const { generateOtpValidation } = require("../../validation/user-validation");

// Generate Email OTP
const generateEmailOtp = async (request, response) => {
    try {
        const { mobile } = request.body;

        // Validate
        const { value, error } = generateOtpValidation.validate(
            { mobile },
            { abortEarly: true }
        );

        if (error) {
            const formattedMessage = error.details
                .map(err => `(${err.path.join(".")}) ${err.message}`)
                .join(" | ");

            return response.validationError(formattedMessage);
        }

        // Check user
        const user = await userServices.isUserExistWithMobile(value.mobile);

        if (!user) {
            return response.notFound("Mobile number is not registered.");
        }

        if (user.isActive == "false") {
            return response.badRequest("Account is currently inactive. Contact admin.");
        }

        if (user.userType !== "visitor") {
            return response.badRequest("Email OTP is available only for visitor accounts.");
        }

        // Check if Email OTP already exists
        const isOtpValid = await userServices.isEmailOtpStillValid(user.email);

        if (isOtpValid) {
            return response.badRequest(
                "Email OTP already sent. Please wait before requesting again."
            );
        }

        // Generate 4-digit OTP
        const emailOtp = Math.floor(1000 + Math.random() * 9000);

        // Save Email OTP
        const isOtpSaved = await userServices.saveEmailOtp({
            email: user.email,
            otp: emailOtp,
        });

        if (!isOtpSaved) {
            return response.badRequest("Failed to generate Email OTP.");
        }

        const html = `
            <h2>Your Login OTP</h2>
            <p>Your Email OTP is:</p>
            <h1 style="letter-spacing:5px;">${emailOtp}</h1>
            <p>This OTP is valid for <b>2 minutes</b>.</p>
            <p><b>Do not share this OTP with anyone.</b></p>
        `;

        await sendEmail(user.email, "Your Login OTP", html);

        return response.success(
            `Email OTP sent successfully to ${user.email}.`,
            emailOtp // Remove this in production
        );
    } catch (error) {
        console.log(error.message);

        logError(error, {
            api: "generateEmailOtp",
            req: request,
        });

        return response.error(error);
    }
};

module.exports = generateEmailOtp;