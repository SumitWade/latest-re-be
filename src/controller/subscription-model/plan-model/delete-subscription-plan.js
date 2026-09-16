const subscriptionPlanService = require("../../../services/subscription-plan.service");
const logError = require("../../../utils/helper/pino-log-error");
const mongoose = require("mongoose");
const { idValidation } = require("../../../validation/common-validation");

const deleteSubscriptionPlan = async (request, response) => {
    try {
        //Extract data from the request 
        const {id} = request.body;

        //Validation 
        const {value, error} = idValidation.validate({id});
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };
    
        // Check if record exists
        const isRecordExist = await subscriptionPlanService.getSubscriptionRecordByObjId(id);
        if (!isRecordExist) {
            return response.notFound('Record not found.')
        }

        //Check if the record is last record 
        const getRecords = await subscriptionPlanService.getAllSubscriptions();
        if(getRecords.length == 1){
            return response.badRequest("Minimum one subscription required.")
        }

        const result = await subscriptionPlanService.deleteSubscriptionPlan(id);   
        if(result.acknowledged && result.deletedCount > 1){
            return response.success('Subscription record has been deleted.');
        } else {
            return response.badRequest("Failed to delete.")
        }
    } catch (error) {
        logError(error, {
            api: "deleteSubscriptionPlan",
            req: request
        });
        return response.error(error);
    }
};

module.exports = deleteSubscriptionPlan; 