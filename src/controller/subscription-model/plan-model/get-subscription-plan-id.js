const subscriptionPlanService = require("../../../services/subscription-plan.service");
const logError = require("../../../utils/helper/pino-log-error");
const { idValidation } = require("../../../validation/common-validation");

const getSubscriptionPlanByObjId = async (request, response) => {
    try {
        //Extract data from the request body
        const {id} = request.body;

        //Validation 
        const {value, error} = idValidation.validate({id});
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };
        
        //get data from db
        const result = await subscriptionPlanService.getSubscriptionRecordByObjId(id);
        if(result){
            return response.success("Data fetched successfully", result)
        }else {
            return response.notFound("No record found")
        }
    
    } catch (error) {
        // store log in error.log file
        logError(error, {
            api: 'getSubscriptionPlanByObjId',
            req: request,
        });
        return response.error(error);
    }
}

module.exports = getSubscriptionPlanByObjId;