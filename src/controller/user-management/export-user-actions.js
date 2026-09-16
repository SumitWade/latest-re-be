const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");

const exportUserActions = async (request, response) => {
    try {
        const { action, startDate, endDate, userId, month } = request.body;
        const userActions = await userServices.exportUserActions(action, startDate, endDate, userId, month);
        return response.success("User actions exported successfully", userActions);
    } catch (error) {
        logError(error, {
            api: "exportUserActions",
            req: request
        })
        return response.error(error);
    }
}
module.exports = exportUserActions;