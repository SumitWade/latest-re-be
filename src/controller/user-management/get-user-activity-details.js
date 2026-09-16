const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");

const getUserActivityDetails = async (request, response) => {
    try {
        const { page, searchString , date} = request.body;
        const result = await userServices.getUserActivityDetails(page, searchString , date)
        return response.paginated(result.actions, result.totalPages, result.totalRecords)
    } catch (error) {
        logError(error, {
            api: "getUserActivityDetails",
            req: request
        });
        return response.error(error);
    }
}
module.exports = getUserActivityDetails