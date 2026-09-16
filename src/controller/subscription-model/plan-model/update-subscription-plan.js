const subscriptionPlanService = require("../../../services/subscription-plan.service");
const logError = require("../../../utils/helper/pino-log-error");
const { validateUpdateSubscriptionPlan } = require("../../../validation/subscription-plan-validation");

const updateSubscriptionPlan = async (request, response) => {
    try {
        // Extracting the required fields from the request body
        const {
            id,
            name,
            description,
            plans,
            maxListings,
            featuredLimit,
            projectLimit,
            searchPriority,
            homepageFeatured,
            verifiedBadge,
            showcaseProperty,
            bulkUpload,
            isPlanActive
        } = request.body;

        // Validating the required fields
        const {value, error} = validateUpdateSubscriptionPlan.validate({
            id,
            name,
            description,
            plans,
            maxListings,
            featuredLimit,
            projectLimit,
            searchPriority,
            homepageFeatured,
            verifiedBadge,
            showcaseProperty,
            bulkUpload,
            isPlanActive
        }, {abortEarly: true});
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

        //Check if the plan name already exist 
        const isExist = await subscriptionPlanService.checkSubscriptionPlanWhileUpdate(id, name);
        if (isExist) {
            return response.status(400).json({
                status: "FAILED",
                message: `${name} plan already exists`
            });
        };

        //data to update 
        const dataToUpdate = {
            name,
            description,
            plans,
            maxListings,
            featuredLimit,
            projectLimit,
            searchPriority,
            homepageFeatured,
            verifiedBadge,
            showcaseProperty,
            bulkUpload,
            isPlanActive
        }

        const result = await subscriptionPlanService.updateSubscriptionPlan(id, dataToUpdate);
        if(result?.acknowledged && result?.modifiedCount > 0){
            return response.status(200).json({
                status: "SUCCESS",
                message: "Subscription plan updated successfully."
            });
        } else {
            return response.badRequest("Failed to update plan")
        }
    } catch (error) {
        console.log(error)
        // store log in error.log file
        logError(error, {
            api: 'updateSubscriptionPlan',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = updateSubscriptionPlan