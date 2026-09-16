const wishlistService = require("../../services/wishlist.service");
const logError = require("../../utils/helper/pino-log-error");
const collectUserActionData = require("../user-management/collect-user-action-data");
const addPropertyToWishlist = async (request, response) => {
    try {
        const { propertyId, isLiked, projectId } = request.body;
        if (!isLiked) {
            return response.badRequest("isLiked is required");
        }
        const data = {
            propertyId,
            userId: request.id,
            isLiked,
            projectId

        }
        //same user can not liked multiple tiles same property 
        const existingWishlist = await wishlistService.checkWishlist(data);
        if (existingWishlist) {
            return response.error("You already add this property to your wishlist");
        }
        const result = await wishlistService.addPropertyToWishlist(data);
        if (!result) {
            return response.error("Failed to add property to wishlist");
        }

        
        await collectUserActionData({
            userId: request.id,
            actionType: 'WISHLIST_PROPERTY',
            propertyId: propertyId,
            projectId: projectId,
            action: "Property Added To Wishlist"
        });

        return response.success("Property added to wishlist successfully", result);
    } catch (error) {
        logError(error, {
            api: "addPropertyToWishlist",
            req: request
        })
        return response.error(error)
    }
}
module.exports = addPropertyToWishlist;