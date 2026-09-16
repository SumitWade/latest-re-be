const Review = require("../model/review.model");
const countPages = require("../utils/helper/count-pages");
const limit = process.env.LIMIT || 20
const PlatformRating = require("../model/platform-rating.model");
const User = require("../model/user.model");
const reviewService = {
    addReview: (review) => {
        return Review.create(review)
    },
    getReviewByUserId: async (userId, targetId, reviewType = "property") => {
        try {
            const query = { reviewedBy: userId, reviewType };
            if (reviewType === "project") {
                query.projectId = targetId;
            } else {
                query.propertyId = targetId;
            }
            return await Review.findOne(query);
        } catch (error) {
            throw error
        }
    },
    getReviewByPropertyId: async (propertyId) => {
        try {
            return await Review.find({ propertyId })
        } catch (error) {
            throw error
        }
    },
    getReviewList: async (page = 1, searchString = "", reviewType) => {
        try {
            const filter = { reviewType }
            if (searchString) {
                const regex = new RegExp(searchString, 'i');

                filter.$or = [
                    { title: regex },
                    { review: regex },

                ];
            }
            //set pagination to default one
            if (page < 1) page = 1;

            const skip = (page - 1) * limit;
            const totalRecords = await Review.countDocuments(filter);
            const result = await Review.find(filter)
                .populate('reviewedBy', 'name email mobile')
                .populate('propertyId', 'propertyTitle')
                .skip(skip).limit(limit).sort({ createdAt: -1 })
            if (!result) {
                return false;
            }
            return {
                result,
                totalPages: await countPages(totalRecords),
                totalRecords: totalRecords
            };
        } catch (error) {
            throw error
        }
    },
    getPublicReviewByPropertyId: async (propertyId, reviewType) => {
        try {
            //set pagination to default one
            const filter = { propertyId, reviewType, isActive: true }
            const result = await Review.find(filter)
                .populate('reviewedBy', 'name email')
                .populate('propertyId', 'propertyTitle')
                .sort({ createdAt: -1 })
            if (!result) {
                return false;
            }
            return result;
        } catch (error) {
            throw error
        }
    },
    getReviewByObjId: async (reviewId) => {
        try {
            return await Review.findById(reviewId)
        } catch (error) {
            throw error
        }
    },
    updateReviewStatus: async (reviewId, dataToUpdate) => {
        try {
            return await Review.findByIdAndUpdate(reviewId, dataToUpdate)
        } catch (error) {
            throw error
        }
    },
    // platform rating---------------------------------------

    getRatingByUserId: async (userId) => {
        try {
            const result = await PlatformRating.findOne({ userId });
            if (!result) {
                return false;
            }
            return result;
        }
        catch (error) {
            throw error
        }
    },
    addPlatformRating: async (data) => {
        try {
            const result = await PlatformRating.create(data);
            // update user with rating is Done
            await User.findByIdAndUpdate(data.userId, { isPlatformRatingDone: true });
            if (!result) {
                return false;
            }
            return result;
        }
        catch (error) {
            throw error
        }
    },
    getPlatformRating: async () => {
        try {
            const filter = {}
            // avg of rating
            const result = await PlatformRating.aggregate([
                {
                    $group: {
                        _id: null,
                        avgRating: { $avg: "$rating" }
                    }
                }
            ]);
            if (!result) {
                return false;
            }
            return result;
        }
        catch (error) {
            throw error
        }
    },
    getPaginatedListForPlatform: async (page, searchString) => {
        try {
            const filter = {}
            if (searchString) {
                filter.suggestion = { $regex: searchString, $options: "i" };
            }
            const result = await PlatformRating.find(filter)
                .populate('userId', 'name email mobile')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
            if (!result) {
                return false;
            }
            return {
                result,
                totalPages: await countPages(await PlatformRating.countDocuments(filter)),
                totalRecords: await PlatformRating.countDocuments(filter)
            };
        } catch (error) {
            throw error
        }
    }
}
module.exports = reviewService;