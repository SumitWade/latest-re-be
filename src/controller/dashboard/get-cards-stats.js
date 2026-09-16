const dashboardService = require("../../services/dashboard.service");
const logError = require("../../utils/helper/pino-log-error")

const getCardsStats = async (request, response) => {
    try {
        const id = request.id;
        const userType = request.userType;
        const result = await dashboardService.getCardsStats({ id, userType });
        return response.success('Cards stats fetched successfully', result);
    } catch (error) {
        logError(error, { api: 'getCardsStats', request });
        return response.error(error);
    }
}

module.exports = getCardsStats;
