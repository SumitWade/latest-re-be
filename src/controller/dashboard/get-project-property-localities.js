const dashboardService = require("../../services/dashboard.service");
const logError = require("../../utils/helper/pino-log-error")
const getLocalitiesWiseProjectProperty = async (request , response) => {
    try {
        const result = await dashboardService.getLocalitiesWiseProjectProperty();
        if(result.length > 0){
            return response.success("Data fetched successfully.", result);
        } else {
            return response.notFound("No data available")
        }
    } catch (error) {
        logError(error, {
            api: 'getLocalitiesWiseProjectProperty',
            req: request,
        });
        
    }
}
module.exports = getLocalitiesWiseProjectProperty;