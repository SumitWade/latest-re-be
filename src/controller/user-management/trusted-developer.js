const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");

const trustedDeveloper = async (request, response) => {
    try {
        const result = await userServices.getTrustedDeveloperUsers();
        if (result) {
            return response.success("Trusted developer fetched successfully.", result)
        }
        else {
            return response.notFound("Trusted developer not found");
        }
    } catch (error) {
        logError(error, {
            api: "trustedDeveloper",
            req: request
        })
        return response.error(error);
    }
}

module.exports = trustedDeveloper;
