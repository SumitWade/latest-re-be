const logError = require("../../utils/helper/pino-log-error");
const generateUserJWT = require("../../middlewares/generate.token");
const { googleAuth } = require("./google-auth");

const googleLogin = async (request, response) => {
    try {
        const { idToken, userType } = request.body;

        if (!idToken) {
            return response.badRequest("Id token is required");
        }

        // Verify Google token and get/create user
        const user = await googleAuth(idToken, userType);

        // Generate your application's JWT
        const userDetails = {
            _id: user._id,
            name: user.name,
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
        console.log(error.message);
        logError(error, {
            api: "googleLogin",
            req: request,
        });
        return response.error(error);
    }
};

module.exports = googleLogin;