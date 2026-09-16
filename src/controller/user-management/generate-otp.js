const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");
const sendEmail = require("../../utils/helper/send-mail");
const { generateOtpValidation } = require("../../validation/user-validation");

const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days

// Generate OTP for mobile
const generateOtp = async (request, response) => {
    try {
        //Extract data from the request body
        const { mobile } = request.body;

        // Validate
        const { value, error } = await generateOtpValidation.validate({ mobile }, { abortEarly: true });
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

        //check whether the user is active
        if (user.isActive == "false") {
            return response.badRequest("Account is currently inactive contact to admin")
        }

        const maskedMobile = "*".repeat(value.mobile.length - 4) + value.mobile.slice(-4);
        // SMART SESSION CHECK (for uninstall)
        //  Silent cleanup of very old stale sessions (safe)
        if (user.isLogIn && user.lastLoginAt) {
            const lastLoginTime = new Date(user.lastLoginAt).getTime();
            const now = Date.now();
            if ((now - lastLoginTime) > SESSION_TIMEOUT) {
                await userServices.updateUser(user._id, {
                    isLogIn: false,
                    deviceId: null,
                    lastLoginAt: null
                });
            }
        }

        // Check if OTP already exists and still valid (rate limiting)
        const isOtpValid = await userServices.isOtpStillValid(mobile);
        if (isOtpValid) {
            return response.badRequest(`OTP already sent on (${maskedMobile}). Please wait before requesting again.`)
        }

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000);
        const dataToSend = { mobile, otp };

        // OTP Email HTML Template
        // const html = `<h2>Your Login OTP</h2>
        //     <p>Your OTP for login is:</p>
        //     <h1 style="letter-spacing: 5px;">${otp}</h1>
        //     <p>This OTP is valid for 2 minutes.</p>
        //     <p><b>Do not share this OTP with anyone.<b></p>`

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px 0;">
                <tr>
                <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ecfdf5; padding:30px 0;">          
                    <!-- Header / Logo -->
                    <tr>
                        <td align="center" style="padding-bottom:20px;">
                        <h2 style="margin:0; color:#2c3e50;">Real Estate</h2>
                        </td>
                    </tr>

                    <!-- Title -->
                    <tr>
                        <td align="center" style="padding-bottom:10px;">
                        <h3 style="margin:0; color:#333;">Your Secure One-Time Password (OTP)</h3>
                        </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                        <td align="center" style="color:#555; font-size:15px; padding:10px 20px;">
                        Use the following OTP to complete your login. This OTP is valid for <b>2 minutes</b>.
                        </td>
                    </tr>

                    <!-- OTP BOX (Standard Style) -->
                    <tr>
                        <td align="center" style="padding:30px 0;">
                        <div style="
                            display:inline-block;
                            padding:18px 36px;
                            font-size:34px;
                            letter-spacing:10px;
                            font-weight:bold;
                            color:#1e40af;
                            background:#eaf2ff;
                            border-radius:10px;
                            border:1px dashed #93c5fd;">
                            ${otp}
                        </div>
                        </td>
                    </tr>

                    <!-- Security Note -->
                    <tr>
                        <td align="center" style="color:#777; font-size:14px; padding:0 20px;">
                        Do not share this OTP with anyone.
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top:30px; font-size:12px; color:#999;">
                        If you did not request this OTP, please ignore this email.<br/>
                        © ${new Date().getFullYear()} realestate. All rights reserved.
                        </td>
                    </tr>

                    </table>
                </td>
                </tr>
            </table>
            </body>
            </html>
            `;

        // Save OTP in DB
        const isOtpSaved = await userServices.saveOtp(dataToSend);
        if (isOtpSaved) {
            if (user.userType == "visitor") {
                // Send Email for OTP
                sendEmail(user.email, "Your Login OTP", html)
                    .then(() => console.log("OTP email sent"))
                    .catch(err => console.error("OTP Email Error:", err));
            }

            const msg = user.userType == "visitor" ? `OTP sent to registered mobile (${maskedMobile}) and OTP-${otp} ` : `OTP sent successfully to registered mobile number (${maskedMobile}) and OTP-${otp}.`
            return response.success(msg, otp)
        } else {
            return response.badRequest("Failed to send OTP.")
        }
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'generateOtp',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = generateOtp;
