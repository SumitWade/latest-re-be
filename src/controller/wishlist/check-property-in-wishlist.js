const wishlistService = require("../../services/wishlist.service");
const logError = require("../../utils/helper/pino-log-error");

const checkPropertyInWishlist = async (request, response) => {
    try {
        const { propertyId, userId , projectId} = request.body;
        if ((!propertyId ) || !userId) {
            return response.badRequest("propertyId and userId is required");
        }
        const data = {
            propertyId,
            userId,
            projectId
        }
        const result = await wishlistService.checkPropertyInWishlist(data);
        if (!result) {
            return response.notFound("Property not found in wishlist");
        }
        return response.success("Property found in wishlist", result);
    } catch (error) {
        logError(error, {
            api: "checkPropertyInWishlist",
            req: request
        })
        return response.error(error)
    }
}
module.exports = checkPropertyInWishlist;