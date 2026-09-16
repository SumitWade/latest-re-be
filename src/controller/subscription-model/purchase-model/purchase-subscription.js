const subscriptionPlanService = require("../../../services/subscription-plan.service");
const userServices = require("../../../services/user.service");
const logError = require("../../../utils/helper/pino-log-error");
const { purchaseSubscriptionValidation } = require("../../../validation/subscription-plan-validation");

const purchaseSubscription = async (request, response) => {
    try {
        //Extract data from the request 
        const { _id } = request;
        //Extract data from the request body
        const { planId, duration } = request.body;

        //validation
        const { value, error } = purchaseSubscriptionValidation.validate({ planId, duration }, { abortEarly: true })
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        //check if the plan record exist or not 
        const isRecordExist = await subscriptionPlanService.getSubscriptionRecordByObjId(planId);
        if (!isRecordExist) {
            return response.notFound("subscription plan record not found")
        };

        //check if the purchase already made and its active 
        const isLastPurchaseActive = await subscriptionPlanService.getPurchasedSubscriptionDetails(_id)
        if (isLastPurchaseActive && (isLastPurchaseActive?.isPurchaseActive == true)) {
            return response.badRequest("Last purchase is still active, Can't process the request.")
        };

        // Find the selected duration plan
        const selectedPlan = isRecordExist.plans.find(
            (plan) => plan.duration === Number(duration)
        );

        //Check if the 

        //Check if the 
        if (isRecordExist.isPlanActive == false) {
            return response.validationError("Subscription plan is currently inactive");
        }

        // Get price
        const price = selectedPlan.price;

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + Number(duration));

        //Data formate 
        const dataFormate = {
            userId: _id,
            planId,
            duration,
            price,
            startDate,
            endDate,
            status: "Active",
            paymentStatus: "Paid",
            maxListings: isRecordExist.maxListings,
            featuredLimit: isRecordExist.featuredLimit,
            projectLimit: isRecordExist.projectLimit,
            searchPriority: isRecordExist.searchPriority,
            isPurchaseActive: true
        };

        let result;
        if (isLastPurchaseActive && isLastPurchaseActive.isPurchaseActive == false) {
            // Previous purchase exists but is inactive/expired
            result = await subscriptionPlanService.updatePurchasedSubscription(isLastPurchaseActive._id, dataFormate);
        } else {
            // First time purchase
            result = await subscriptionPlanService.createPurchaseSubscription(dataFormate);
        }
        if (result._id || (result.acknowledged && result.modifiedCount > 0)) {
            //update user details with purchase id
            await userServices.updateUser(_id, { purchaseId: result._id })
            return response.success(`Your ${duration} month's subscription plan activated successfully.`)
        } else {
            return response.badRequest("Failed to purchase")
        }

    } catch (error) {
        // store log in error.log file
        logError(error, {
            api: 'purchaseSubscription',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = purchaseSubscription;