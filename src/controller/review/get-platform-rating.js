const reviewService = require("../../services/review.service");
const logError = require("../../utils/helper/pino-log-error");

const getPlatformRating = async (request, response)=>{

    try {
        const result = await reviewService.getPlatformRating();
        return response.success("Platform rating fetched successfully", result);
    } catch (error) {
        logError(error, {
            api: "getPlatformRating",
            req: request
        });
        return response.error(error);
    }
}

module.exports = getPlatformRating;