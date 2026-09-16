const reviewService = require("../../services/review.service");
const logError = require("../../utils/helper/pino-log-error");
const { platformRating } = require("../../validation/common-validation");

// add review in platform schema
const addPlatformRating = async (request, response) => {
    try {
        const { rating, suggestion } = request.body
        // validation
        const validateError = platformRating.validate({ rating })
        if (validateError.error) {
            return response.validationError(validateError.error.message)
        }
        // only visitor can add review
        // if(request.userType !== "visitor"){
        //     return response.error("Only visitor can add review")
        // }
        const userId = request.id;
        // check alreday rating done by same user
        const isRatingDoneBySameUser = await reviewService.getRatingByUserId(userId)
        if (isRatingDoneBySameUser) {
            return response.error("You have already rate to this platform")
        }
        const dataToInsert = {
            userId: userId,
            rating,
            suggestion
        }
         await collectUserActionData({
            userId: request.id,
            actionType: 'ENQUIRY_ON_PROPERTY',
            propertyId: propertyId,
            action: "User Enquired About The Property"
        });
        const result = await reviewService.addPlatformRating(dataToInsert)
        return response.success("Review added successfully", result)
    } catch (error) {
        logError(error, {
            api: "addPlatformRating",
            req: request
        });
        return response.error(error);
    }
}

module.exports = addPlatformRating;