const logError = require("../../utils/helper/pino-log-error");
const reviewService = require("../../services/review.service");

const getPropertyReviewPublic = async (request, response) => {
    try {
        const { propertyId, reviewType = "property" } = request.body;
        const result = await reviewService.getPublicReviewByPropertyId(propertyId, reviewType);
        if (!result) {
            return response.notFound("No review found")
        }
        return response.success("Review fetched successfully", result);
    } catch (error) {
        logError(error, {
            api: "getPropertyReviewPublic",
            req: request
        });
        return response.error(error);
    }
}
module.exports = getPropertyReviewPublic;