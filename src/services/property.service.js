const { ObjectId } = require("mongodb");
const propertyUpdateRequest = require("../model/pending-property-approval.model");
const Property = require("../model/property.model");
const countPages = require("../utils/helper/count-pages");
const limit = Number(process.env.LIMIT) || 20;
const mongoose = require("mongoose")

const getHotSellingPipeline = () => {
    return [
        // Wishlist Count
        {
            $lookup: {
                from: "wishlists",
                let: { propertyId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$propertyId", "$$propertyId"] },
                                    { $eq: ["$isLiked", true] }
                                ]
                            }
                        }
                    },
                    { $count: "count" }
                ],
                as: "wishlist"
            }
        },

        // Enquiry Count
        {
            $lookup: {
                from: "propertyenquiries",
                let: { propertyId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$propertyId", "$$propertyId"] }
                        }
                    },
                    { $count: "count" }
                ],
                as: "enquiry"
            }
        },
        // rating and reviews 
        {
            $lookup: {
                from: "reviews",
                let: { propertyId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$propertyId", "$$propertyId"] },
                                    { $eq: ["$reviewType", "property"] },
                                    { $eq: ["$isActive", true] }
                                ]
                            }
                        }
                    }
                ],
                as: "propertyReviews"
            }
        },

        // Counts
        {
            $addFields: {
                wishlistCount: {
                    $ifNull: [{ $arrayElemAt: ["$wishlist.count", 0] }, 0]
                },
                enquiryCount: {
                    $ifNull: [{ $arrayElemAt: ["$enquiry.count", 0] }, 0]
                },
                reviewsCount: { $size: "$propertyReviews" },
                averageRating: { $ifNull: [{ $avg: "$propertyReviews.rating" }, 0] }
            }
        },

        // Total
        {
            $addFields: {
                totalCount: {
                    $add: ["$wishlistCount", "$enquiryCount"]
                }
            }
        },

        // Owner Details
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true
            }
        },

        // Return only required property fields
        {
            $project: {
                wishlistCount: 1,
                enquiryCount: 1,
                totalCount: 1,
                propertyTitle: 1,
                propertyType: 1,
                city: 1,
                locality: 1,
                price: 1,
                priceIn: 1,
                gallery: 1,
                status: 1,
                createdAt: 1,
                createdBy: 1,
                propertyCategory: 1,
                isVerified: 1,
                state: 1,
                reviewsCount: 1,
                averageRating: 1,
                isHotsellingProperty: 1,
                floorPlans: 1,
                brochure: 1,
                allUploadedFiles: 1,
                virtualTour: 1,
                threeSixtyView: 1,
                ownerDetails: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    userType: 1,

                }
            }
        }
    ]
}

const propertyServices = {
    addProperty: (dataToInsert) => {
        return Property.create(dataToInsert)
    },
    checkPropertyNameWhileAdd: (propertyName) => {
        return Property.findOne({ propertyTitle: propertyName })
    },
    checkPropertyName: (id, proName) => {
        return Property.findOne({ _id: { $ne: id }, propertyTitle: proName })
    },
    getPendingPropertyByObjId: (propertyId) => {
        return propertyUpdateRequest.findOne({ propertyId });
    },
    updatePendingPropertyUpdate: async (pendingId, propertyData) => {
        try {
            return await propertyUpdateRequest.findByIdAndUpdate(
                pendingId,
                {
                    $set: {
                        status: "pending",
                        propertyData,
                        updatedAt: new Date()
                    }
                },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    },
    createPendingPropertyUpdate: (data) => {
        return propertyUpdateRequest.create(data);
    },
    updatePropertyDetails: (id, dataToUpdate) => {
        return Property.updateOne({ _id: id }, { $set: dataToUpdate }, { new: true, runValidators: false });
    },
    getPropertyByObjId: (id) => {
        return Property.findOne({ _id: id })
    },
    propertiesPaginatedList: async (page = 1, searchString, propertyType, id, userType) => {
        let filter = {};
        //when type is provided
        if (propertyType) {
            filter.propertyCategory = propertyType;
        }

        // get 
        if (id && userType !== "admin") {
            filter.createdBy = id
        }
        // search
        if (searchString) {
            const regex = new RegExp(searchString, "i");
            filter.$or = [
                { propertyTitle: regex },
                { email: regex },
                { mobile: regex },
                { status: regex },
            ];
        }
        //set pagination to default one
        if (page < 1) page = 1;

        //response 
        const totalRecords = await Property.countDocuments(filter);
        const result = await Property.find(filter, { propertyTitle: 1, status: 1, isActive: 1, isVerified: 1, propertyCategory: 1, isHotsellingProperty: 1, isTrending: 1 }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        return {
            result,
            totalPages: await countPages(totalRecords),
            totalRecords
        };
    },
    updatePropertyActions: async (page = 1, searchString, propertyType, id, userType) => {
        let filter = { isActive: true };
        //when type is provided
        if (propertyType) {
            filter.propertyCategory = propertyType;
        }

        // get 
        if (id && userType !== "admin") {
            filter.createdBy = id
        }
        // search
        if (searchString) {
            const regex = new RegExp(searchString, "i");
            filter.$or = [
                { name: regex },
                { email: regex },
                { mobile: regex }
            ];
        }
        //set pagination to default one
        if (page < 1) page = 1;

        //response 
        const totalRecords = await Property.countDocuments(filter);
        const result = await Property.find(filter, { propertyTitle: 1, status: 1, isActive: 1, isVerified: 1, propertyCategory: 1, isHotsellingProperty: 1, isTrending: 1 }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        return {
            result,
            totalPages: await countPages(totalRecords),
            totalRecords
        };
    },
    deletePendingPropertyUpdate: (id) => {
        return propertyUpdateRequest.findByIdAndDelete(id);
    },
    updatePendingPropertyStatus: async (id, data) => {
        try {
            return await propertyUpdateRequest.findByIdAndUpdate(
                id,
                { $set: data },
                {
                    new: true,
                    runValidators: true
                }
            );
        } catch (error) {
            throw error;
        }
    },

    getPublicPropertyList: async (page = 1, filters = {}) => {
        try {
            console.log(filters, "99999999999999")
            const limit = 9
            const query = { isActive: true };

            const regexFilter = (value) => ({
                $regex: `^${value}$`,
                $options: "i"
            });

            // Search
            if (filters.searchString) {
                query.$or = [
                    { propertyTitle: { $regex: filters.searchString, $options: "i" } },
                    { propertyType: { $regex: filters.searchString, $options: "i" } },
                    { propertyCategory: { $regex: filters.searchString, $options: "i" } },
                    { city: { $regex: filters.searchString, $options: "i" } }
                ];
            }

            // Listing Type
            if (filters.listingType && filters.listingType !== "All") {
                query.listingType = regexFilter(filters.listingType);
            }

            // Property Type
            if (filters.propertyType && filters.propertyType !== "All Types") {
                query.propertyType = regexFilter(filters.propertyType);
            }

            // Residential Property Type
            if (filters.residentialPropertyType) {
                const pattern = filters.residentialPropertyType.replace(/\s*\/\s*/g, '|');
                query.residentialPropertyType = { $regex: pattern, $options: "i" };
            }

            // Commercial Property Type
            if (filters.commercialPropertyType) {
                const pattern = filters.commercialPropertyType.replace(/\s*\/\s*/g, '|');
                query.commercialPropertyType = { $regex: pattern, $options: "i" };
            }

            // Land / Plot Property Type
            if (filters.landPlotPropertyType) {
                const pattern = filters.landPlotPropertyType.replace(/\s*\/\s*/g, '|');
                query.landPlotPropertyType = { $regex: pattern, $options: "i" };
            }

            // Property Category
            if (filters.propertyCategory && filters.propertyCategory !== "All") {
                query.propertyCategory = regexFilter(filters.propertyCategory);
            }

            // Posted By
            if (filters.postedBy && filters.postedBy !== "All") {
                query.owner = regexFilter(filters.postedBy);
            }

            // Construction Status
            if (filters.constructionStatus && filters.constructionStatus !== "All") {
                query.propertyCondition = regexFilter(filters.constructionStatus);
            }

            // City
            if (filters.city) {
                query.city = regexFilter(filters.city);
            }
            // Bedrooms
            if (filters.bedrooms && filters.bedrooms !== "Any") {
                query.bedrooms = {
                    $gte: Number(filters.bedrooms)
                };
            }

            // Bathrooms
            if (filters.bathrooms && filters.bathrooms !== "Any") {
                query.bathrooms = {
                    $gte: Number(filters.bathrooms)
                };
            }

            // Price
            if (filters.minPrice || filters.maxPrice) {

                query.price = {};

                if (filters.minPrice) {
                    query.price.$gte = Number(filters.minPrice);
                }

                if (filters.maxPrice) {
                    query.price.$lte = Number(filters.maxPrice);
                }

            }

            // Amenities
            if (
                filters.amenities &&
                filters.amenities.length > 0
            ) {

                query.amenities = {
                    $all: filters.amenities
                };

            }

            //----------------------------------------
            // Special Features
            //----------------------------------------

            if (
                filters.specialFeatures &&
                filters.specialFeatures.length > 0
            ) {

                query.specialFeatures = {
                    $all: filters.specialFeatures
                };
            }

            if (page < 1) page = 1;

            const totalRecords = await Property.countDocuments(query);

            // const result = await Property.aggregate([
            //     { $match: query },
            //     { $sort: { createdAt: -1 } },
            //     { $skip: (page - 1) * limit },
            //     { $limit: limit },
            //     {
            //         $lookup: {
            //             from: "reviews",
            //             let: { propertyId: "$_id" },
            //             pipeline: [
            //                 {
            //                     $match: {
            //                         $expr: {
            //                             $and: [
            //                                 { $eq: ["$propertyId", "$$propertyId"] },
            //                                 { $eq: ["$reviewType", "property"] },
            //                                 { $eq: ["$isActive", true] }
            //                             ]
            //                         }
            //                     }
            //                 }
            //             ],
            //             as: "propertyReviews"
            //         }
            //     },
            //     {
            //         $addFields: {
            //             reviewsCount: { $size: "$propertyReviews" },
            //             averageRating: { $ifNull: [{ $avg: "$propertyReviews.rating" }, 0] }
            //         }
            //     },
            //     {
            //         $project: {
            //             propertyReviews: 0
            //         }
            //     }
            // ]);

            const now = new Date();
            const result = await Property.aggregate([
                // 1. Existing property filters
                { $match: query },

                // 2. Get purchased subscription using purchaseId
                {
                    $lookup: {
                        from: "purchasedsubscriptions",
                        localField: "purchaseId",
                        foreignField: "_id",
                        as: "purchase"
                    }
                },

                // 3. Convert purchase array into object
                {
                    $unwind: {
                        path: "$purchase",
                        preserveNullAndEmptyArrays: true
                    }
                },

                // 4. Calculate current search priority
                {
                    $addFields: {
                        effectiveSearchPriority: {
                            $cond: [
                                { $eq: ["$purchase.isPurchaseActive", true] },
                                { $ifNull: ["$purchase.searchPriority", 0] },
                                0
                            ]
                        }
                    }
                },

                // 5. Sort by search priority first
                {
                    $sort: {
                        effectiveSearchPriority: -1,
                        createdAt: -1
                    }
                },

                // 6. Pagination AFTER sorting
                { $skip: (page - 1) * limit },
                { $limit: limit },

                // 7. lookup
                {
                    $lookup: {
                        from: "reviews",
                        let: { propertyId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$propertyId", "$$propertyId"] },
                                            { $eq: ["$reviewType", "property"] },
                                            { $eq: ["$isActive", true] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "propertyReviews"
                    }
                },
                {
                    $addFields: {
                        reviewsCount: { $size: "$propertyReviews" },
                        averageRating: {
                            $ifNull: [
                                { $avg: "$propertyReviews.rating" },
                                0
                            ]
                        }
                    }
                },
                {
                    $project: {
                        propertyReviews: 0,
                        purchase: 0
                    }
                }
            ]);
            return {

                totalPages: await countPages(totalRecords, limit),
                totalRecords,
                result

            };

        } catch (err) {
            throw err;
        }

    },

    getPropertyById: async (id) => {
        try {
            const result = await Property.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: "reviews",
                        let: { propertyId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$propertyId", "$$propertyId"] },
                                            { $eq: ["$reviewType", "property"] },
                                            { $eq: ["$isActive", true] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "propertyReviews"
                    }
                },
                {
                    $addFields: {
                        reviewsCount: { $size: "$propertyReviews" },
                        averageRating: { $ifNull: [{ $avg: "$propertyReviews.rating" }, 0] }
                    }
                },
                {
                    $project: {
                        propertyReviews: 0
                    }
                }
            ]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw error;
        }
    },
    markPropertyAsHotSelling: async (id) => {
        try {
            // if already true then set false else set true
            const existingProperty = await Property.findOne({ _id: id });
            if (!existingProperty) {
                throw new Error("Property not found");
            }
            const result = await Property.findOneAndUpdate(
                { _id: id },
                { $set: { isHotsellingProperty: !existingProperty.isHotsellingProperty } },
                { new: true }
            );
            return result;
        } catch (error) {
            throw error;
        }
    },
    // getHotsellingProperty: async (page, searchString) => {
    //     try {
    //         let filter = {};
    //         if (searchString) {
    //             const regex = new RegExp(searchString, "i");
    //             filter.$or = [
    //                 { propertyTitle: regex },
    //                 { propertyType: regex },
    //                 { propertyCategory: regex },
    //                 { city: regex }
    //             ];
    //         }
    //         if (page < 1) page = 1;
    //         const totalRecords = await Property.countDocuments({
    //             hotselling: true
    //         });
    //         const result = await Property.find({
    //             hotselling: true
    //         })
    //             .sort({ createdAt: -1 })
    //             .skip((page - 1) * limit)
    //             .limit(limit);
    //         return {
    //             totalPages: await countPages(totalRecords),
    //             totalRecords,
    //             result
    //         };
    //     } catch (error) {
    //         throw error;
    //     }
    // },


    hostSellingPropertyList: async () => {
        try {
            const result = await Property.aggregate(getHotSellingPipeline());
            return result
        } catch (error) {
            throw error
        }
    },
    getHotsellingPropertyByOwnerId: async (ownerId, pageNo = 1) => {
        try {
            const limit = 3;
            const page = Number(pageNo) || 1;
            const skip = (page - 1) * limit;

            const pipeline = [
                ...getHotSellingPipeline(),
                {
                    $match: {
                        createdBy: new mongoose.Types.ObjectId(ownerId),
                        $or: [
                            { totalCount: { $gte: 1 } },
                            { isHotsellingProperty: true }
                        ]
                    }
                },
                {
                    $facet: {
                        result: [
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        totalRecords: [
                            { $count: "count" }
                        ]
                    }
                }
            ];

            const [data] = await Property.aggregate(pipeline);

            const totalRecords = data.totalRecords.length
                ? data.totalRecords[0].count
                : 0;

            const totalPages = Math.ceil(totalRecords / limit);

            return {
                totalRecords,
                totalPages,
                result: data.result,
            };

        } catch (error) {
            throw error;
        }
    },
    getHotsellingProperty: async (pageNo = 1, searchString, type) => {
        try {
            const limit = 9
            const match = {};
            if (searchString) {
                match.$or = [
                    { propertyTitle: { $regex: searchString, $options: "i" } },
                    { city: { $regex: searchString, $options: "i" } },
                    { propertyType: { $regex: searchString, $options: "i" } },
                    { locality: { $regex: searchString, $options: "i" } }
                ];
            };
            if (type) {
                match.propertyCategory = type
            }
            const page = Number(pageNo) || 1;
            const skip = (page - 1) * limit;

            const pipeline = [
                ...getHotSellingPipeline(),
                {
                    $match: {
                        $or: [
                            { totalCount: { $gte: 1 } },
                            { isHotsellingProperty: true }
                        ]
                    }
                },
                ...(Object.keys(match).length ? [{ $match: match }] : []),

                {
                    $facet: {
                        data: [
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        totalRecords: [
                            { $count: "count" }
                        ]
                    }
                }
            ];

            const [result] = await Property.aggregate(pipeline);

            const totalRecords = result.totalRecords.length
                ? result.totalRecords[0].count
                : 0;

            const totalPages = Math.ceil(totalRecords / limit);

            return {
                totalRecords,
                totalPages,
                result: result.data,
            };
        } catch (error) {
            throw error;
        }
    },

    getVerifiedProperty: async () => {
        try {
            const result = await Property.countDocuments({ isVerified: true })
            return result
        } catch (error) {
            throw error;
        }
    },
    updatePropertiesStatusByUserId: async (userId, isActive) => {
        try {
            return await Property.updateMany(
                { createdBy: userId },
                {
                    $set: { isActive: isActive }
                }
            );
        } catch (error) {
            throw error;
        }
    },
    getHousingTopPicks: async () => {
        try {
            const result = await Property.aggregate([
                {
                    $match: { isActive: true }
                },
                {
                    $lookup: {
                        from: "reviews",
                        let: { propertyId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$propertyId", "$$propertyId"] },
                                            { $eq: ["$reviewType", "property"] },
                                            { $eq: ["$isActive", true] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "propertyReviews"
                    }
                },
                {
                    $addFields: {
                        averageRating: { $ifNull: [{ $avg: "$propertyReviews.rating" }, 0] }
                    }
                },
                {
                    $sort: { averageRating: -1, createdAt: -1 }
                },
                {
                    $limit: 5
                },
                {
                    $project: {
                        propertyReviews: 0
                    }
                }
            ])
            return result
        } catch (error) {
            throw error;
        }
    },
    // treanding property
    getTrendingProperties: async (page = 1, searchString) => {
        let filter = { isTrending: true };

        // search
        if (searchString) {
            const regex = new RegExp(searchString, "i");
            filter.$or = [
                { name: regex },
                { email: regex },
                { mobile: regex }
            ];
        }
        //set pagination to default one
        if (page < 1) page = 1;

        //response 
        const totalRecords = await Property.countDocuments(filter);
        const result = await Property.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        return {
            result,
            totalPages: await countPages(totalRecords),
            totalRecords
        };
    },
}

module.exports = propertyServices;