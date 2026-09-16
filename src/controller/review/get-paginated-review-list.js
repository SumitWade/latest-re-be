const logError = require("../../utils/helper/pino-log-error");
const reviewService = require("../../services/review.service");

const getPaginatedReviewList = async (request, response) => {
    try {
        const { page, searchString, reviewType } = request.body;

        const result = await reviewService.getReviewList(page, searchString, reviewType);
        if (!result) {
            return response.notFound("No review found.")
        }

        if (request.userType === "developer") {
            const developerReviewList = await reviewService.getReviewList(page, searchString, reviewType, request._id);
            return response.paginated(developerReviewList.result, developerReviewList.totalPages, developerReviewList.totalRecords);
        }
        else if (request.userType === "admin") {
            return response.paginated(result.result, result.totalPages, result.totalRecords);
        }
        else return response.unauthorized("Unauthorized");
    } catch (error) {
        console.log(error.message);
        logError(error, {
            api: "getPaginatedReviewList",
            req: request
        });
        return response.error(error);
    }
}
module.exports = getPaginatedReviewList;