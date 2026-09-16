const logError = require("../../utils/helper/pino-log-error");
const reviewService = require("../../services/review.service");
const reviewActiveInactive = async (request, response) => {
    try {
        const { id } = request.body;
        const review = await reviewService.getReviewByObjId(id);
        if (!review) {
            return response.error("Review not found");
        }
        const dataToUpdate = {
            isActive: !review.isActive
        }
        const result = await reviewService.updateReviewStatus(id, dataToUpdate)
        return response.success("Review status updated successfully");
    } catch (error) {
        logError(error, {
            api: "reviewActiveInactive",
            req: request
        });
        return response.error(error);
    }
}

module.exports = reviewActiveInactive;