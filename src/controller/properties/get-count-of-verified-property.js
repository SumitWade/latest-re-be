const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");


const getVerifiedProperty = async (request, response) => {
    try {
        const result = await propertyServices.getVerifiedProperty();
        return response.success("Data fetched successfully", result)
    } catch (error) {
        logError(error, {
            api: "getVerifiedProperty",
            req: request
        });
        return response.error(error);
    }
}
module.exports = getVerifiedProperty;