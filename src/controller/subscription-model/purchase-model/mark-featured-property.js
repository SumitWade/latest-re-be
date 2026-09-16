const propertyServices = require("../../../services/property.service");
const subscriptionPlanService = require("../../../services/subscription-plan.service");
const logError = require("../../../utils/helper/pino-log-error");
const { idValidation } = require("../../../validation/common-validation");

const markFeaturedProperty = async (request, response) => {
    try {
        //Extract data from the request 
        const {_id, purchaseId} = request;

        //Extract data from the request body
        const { propertyId } = request.body;

        //Validation 
        const { value, error } = idValidation.validate({ id : propertyId });
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        // Check if property exists
        const isPropertyExist = await propertyServices.getPropertyByObjId(propertyId);
        if (!isPropertyExist) {
            return response.notFound('Property record not exist')
        };

        //check if the purchase exist and its active 
        const isLastPurchaseActive = await subscriptionPlanService.getPurchasedSubscriptionDetails(_id)
        if(!isLastPurchaseActive) {
            return response.badRequest("Purchase record not found")
        };
        if(isLastPurchaseActive.isPurchaseActive == false){
            return response.badRequest("Subscription plan is expired, Can't process the request.")
        };
        if(isLastPurchaseActive.featuredLimit == 0 && isPropertyExist.isPropertyFeatured !== true){
            return response.badRequest("Property featured limit exhausted.")
        };

        const isPlanActive = !isPropertyExist?.isPropertyFeatured;
        const dataToUpdate = { isPropertyFeatured: isPlanActive };

        // save data into db
        const result = await propertyServices.updatePropertyDetails(propertyId, dataToUpdate);
        if (result?.acknowledged && result?.modifiedCount > 0) { 
            // Update purchased subscription featured limit
            const value = isPropertyExist?.isPropertyFeatured
                ? Number(isLastPurchaseActive.featuredLimit) + 1
                : Number(isLastPurchaseActive.featuredLimit) - 1;
              
            const data = await subscriptionPlanService.updatePurchasedSubscription(purchaseId, { featuredLimit: value });            
      
            return response.status(200).json({
                status: "SUCCESS",
                message: isPropertyExist?.isPropertyFeatured
                    ? "Property marked inactive as featured for home page"
                    : "Property marked active as featured for home page",
            });
        } else {
            return response.reqResponse("Failed to make action")
        }
    } catch (error) {
        // store log in error.log file
        logError(error, {
            api: 'markFeaturedProperty',
            req: request,
        });
        return response.error(error);        
    }
};

module.exports = markFeaturedProperty;