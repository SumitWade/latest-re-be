const subscriptionPlanService = require("../../../services/subscription-plan.service");
const { idValidation } = require("../../../validation/common-validation");

const activeInactivePlan = async (request, response) => {
    try {
        //Extract data from the request body
        const { id } = request.body;

        //Validation 
        const { value, error } = idValidation.validate({ id });
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        //check if the record exist or not 
        const isRecordExist = await subscriptionPlanService.getSubscriptionRecordByObjId(id);
        if(!isRecordExist) {
            return response.notFound("subscription plan record not found")
        };

        const isPlanActive = !isRecordExist?.isPlanActive;
        const dataToUpdate = { isPlanActive: isPlanActive };

        // save data into db
        const result = await subscriptionPlanService.updateSubscriptionPlan(id, dataToUpdate);
        if (result?.acknowledged && result?.modifiedCount > 0) {  
            return response.status(200).json({
                status: "SUCCESS",
                message: isRecordExist?.isPlanActive
                    ? "Subscription plan marked as inactive"
                    : "Subscription plan marked as active",
            });
        } else {
            return response.reqResponse("Failed to make action")
        }
    } catch (error) {
        logError(error, {
            api: "activeInactivePlan",
            req: request
        });
        return response.error(error);
    }
};

module.exports = activeInactivePlan;