const logError = require("../../utils/helper/pino-log-error");
const reviewService = require("../../services/review.service")
const platformRatingPaginatedList = async (request, response) => {
    try {
        const { page, searchString } = request.body;
        let result;
         if(request.userType !== 'admin'){
            return response.badRequest("You are not authorized to access module")
        }
        result = await reviewService.getPaginatedListForPlatform(page, searchString);
        if (!result) {
            return response.notFound("No platform rating found.")
        }
        return response.paginated(result.result, result.totalPages, result.totalRecords);
    } catch (error) {
        logError(error, {
            api: "platformRatingPaginatedList",
            req: request
        });
        return response.error(error);
    }
}
module.exports = platformRatingPaginatedList;