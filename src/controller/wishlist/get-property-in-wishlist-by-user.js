const wishlistService = require("../../services/wishlist.service");
const logError = require("../../utils/helper/pino-log-error");

const getUserWishlistProperty = async (request, response) => {
    try {
        const { userId } = request.body;
        if (!userId) {
            return response.badRequest("userId is required");
        }
        const result = await wishlistService.getUserWishlistProperty(userId);
        if (!result) {
            return response.notFound("No property found in wishlist");
        }
        return response.success("Property found in wishlist", result);
    } catch (error) {
        logError(error, {
            api: "getUserWishlistProperty",
            req: request
        })
        return response.error(error)
    }
}
module.exports = getUserWishlistProperty;