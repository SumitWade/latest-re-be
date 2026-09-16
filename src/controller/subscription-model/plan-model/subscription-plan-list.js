const subscriptionPlanService = require("../../../services/subscription-plan.service");
const logError = require("../../../utils/helper/pino-log-error");

const subscriptionPlanList = async (request, response) => {
    try {
        const {userType} = request;

        //Extract data from the request body
        const result = await subscriptionPlanService.subscriptionPlanList(userType);
        if(result.length > 0){
            return response.status(200).json({
                status: "SUCCESS",
                message: "Data fetched successfully",
                result
            })
        } else {
            return response.badRequest("No data available")
        }
    } catch (error) {
        // store log in error.log file
        logError(error, {
            api: 'subscriptionPlanList',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = subscriptionPlanList;