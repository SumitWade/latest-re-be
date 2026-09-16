const subscriptionPlanService = require("../../../services/subscription-plan.service");
const logError = require("../../../utils/helper/pino-log-error");
const { idValidation } = require("../../../validation/common-validation");

const getPurchasedSubscriptionDetails = async (request, response) => {
    try {
        //Extract data from the request
        const {_id} = request;
        
        //get data from db
        const result = await subscriptionPlanService.getPurchasedSubscriptionDetails(_id);
        if(result){
            return response.success("Data fetched successfully", result)
        }else {
            return response.notFound("No record found")
        }
    
    } catch (error) {
        // store log in error.log file
        logError(error, {
            api: 'getPurchasedSubscriptionDetails',
            req: request,
        });
        return response.error(error);
    }
}

module.exports = getPurchasedSubscriptionDetails;