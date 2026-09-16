const jsonWebToken = require("jsonwebtoken");
const userServices = require("../services/user.service");
const logError = require("../utils/helper/pino-log-error");

const userAuthentication = async (request, response, next) => {
    try {
        // Authorization header
        const authHeader = request?.header("authorization");
        if (authHeader) {
            const token = authHeader.split(" ")[1];

            // Verify the JWT token
            jsonWebToken?.verify(token, process.env.JWT_SECRET_KEY, async (error, userDetails) => {
                if (error) {
                    return response.status(401).json({
                        status: "JWT_INVALID",
                        message: "Your session has ended, Please login again."
                    });
                } else {

                    // If the token is valid, check if the user exists in the database
                    request._id = userDetails?._id;
                    const isUserExist = (await userServices.getUserByObjectId(userDetails?._id));
                    if (!isUserExist) {
                        return response.status(401).json({
                            status: "JWT_INVALID",
                            message: "Your session has ended, Please login again.",
                        });
                    };

                    // data to pass in request object
                    request.id = isUserExist?.id;
                    request.name = isUserExist?.name;
                    request.email = isUserExist?.email;
                    request.mobile = isUserExist?.mobile;
                    request.userType = isUserExist?.userType; 
                    request.purchaseId = isUserExist?.purchaseId
                }
                next();
            })
        } else {
            return response.status(401).json({
                status: "JWT_INVALID",
                message: "Your session has ended, Please login again."
            });
        }
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'userAuthentication',
            req: request,
        });
        return response.error(error);
    }
}

module.exports = userAuthentication;