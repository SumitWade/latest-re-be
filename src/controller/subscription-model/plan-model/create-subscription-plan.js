const subscriptionPlanService = require("../../../services/subscription-plan.service");
const logError = require("../../../utils/helper/pino-log-error");
const { validateCreateSubscriptionPlan } = require("../../../validation/subscription-plan-validation");

const createSubscriptionPlan = async (request, response) => {
    try {
        // Extracting the required fields from the request body
        const {
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
        const {value, error} = validateCreateSubscriptionPlan.validate({
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
        },  {abortEarly: true});
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        const isExist = await subscriptionPlanService.getSubscriptionPlan(name);
        if (isExist) {
            return response.status(400).json({
                status: "FAILED",
                message: `${name} plan already exists`
            });
        };

        //data to insert 
        const dataToInsert = {
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

        const result = await subscriptionPlanService.createSubscriptionPlan(dataToInsert);
        if(result?._id){
            return response.status(200).json({
                status: "SUCCESS",
                message: "Subscription plan created successfully."
            });
        } else {
            return response.badRequest("Failed to add plan")
        }
    } catch (error) {
        // store log in error.log file
        logError(error, {
            api: 'createSubscriptionPlan',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = createSubscriptionPlan