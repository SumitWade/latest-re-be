const wishlistService = require("../../services/wishlist.service");
const logError = require("../../utils/helper/pino-log-error");

const removePropertyFromWishlist = async (request, response) => {
    try {
        const { propertyId , projectId} = request.body
        if (!propertyId && !projectId) {
            return response.badRequest("Property id or project id is required");
        }
        let result;
        if (projectId) {
            result = await wishlistService.removePropertyFromWishlist(propertyId || null, request.id, projectId);
        } else {
            result = await wishlistService.removePropertyFromWishlist(propertyId, request.id, null);
        }
        if (!result) {
            return response.notFound("Property not found in wishlist");
        }
        return response.success("Property removed from wishlist", result);
    } catch (error) {
        logError(error, {
            api: "removePropertyFromWishlist",
            req: request
        })
        return response.error(error)
    }
}

module.exports = removePropertyFromWishlist