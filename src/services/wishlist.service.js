const Wishlist = require("../model/wishlist");

const wishlistService = {
    addPropertyToWishlist: async (data) => {
        try {
            return await Wishlist.create(data);
        } catch (error) {
            throw error;
        }
    },
    checkWishlist: async (data) => {
        try {
            return await Wishlist.findOne({
                userId: data.userId,
                propertyId: data.propertyId,
                projectId: data.projectId
            });
        } catch (error) {
            throw error;
        }
    },
    checkPropertyInWishlist: async (data) => {
        try {
            const result = await Wishlist.findOne({
                userId: data.userId,
                propertyId: data.propertyId,
                projectId: data.projectId
            });
            if (!result) {
                return false;
            }
            return true;
        } catch (error) {
            throw error;
        }
    },
    getUserWishlistProperty: async (userId) => {
        try {
            return await Wishlist.find({
                userId: userId
            }).populate({
                path: "propertyId",
                select: "propertyTitle propertyType propertyCategory propertyCondition city bedrooms bathrooms propertyArea price priceIn amenities gallery createdBy"
            }).populate({
                path: "projectId",
                select: "name projectType projectCategory projectCondition city bedrooms bathrooms price amenities gallery propertyArea totalTower totalUnit createdBy"
            });
        } catch (error) {
            throw error;
        }
    },
    removePropertyFromWishlist: async (propertyId, userId, projectId) => {
        try {
            const result = await Wishlist.findOneAndDelete({
                userId: userId,
                propertyId: propertyId,
                projectId: projectId
            });
            if (!result) {
                return false;
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = wishlistService;