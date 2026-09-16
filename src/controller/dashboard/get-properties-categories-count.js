const dashboardService = require("../../services/dashboard.service");
const logError = require("../../utils/helper/pino-log-error");
const getPropertiesCategoriesCount = async (request, response) => {
    try {
        const result = await dashboardService.getPropertyTypeCount();
        if (result.length > 0) {
            return response.success("Data fetched successfully", result);
        } else {
            return response.notFound("No record found")
        }
    } catch (error) {
        logError(error, {
            api: "getPropertiesCategoriesCount",
            req: request
        });
        return response.error(error);
    }
}
module.exports = getPropertiesCategoriesCount;