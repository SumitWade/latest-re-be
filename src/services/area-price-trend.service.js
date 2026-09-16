const { ObjectId } = require("mongodb");
const AreaPriceTrend = require("../model/area-price-trend-model");
const countPages = require("../utils/helper/count-pages");
const limit = Number(process.env.LIMIT) || 20;
const mongoose = require("mongoose");
const Property = require("../model/property.model");


const areaPriceTrendService = {
    addAreaPriceTrends: async (dataToInsert) => {
        try {
            return await AreaPriceTrend.insertOne(dataToInsert);
        } catch (error) {
            throw error;
        }
    },
    getAreaTrendByName: async (city, area) => {
        try {
            return await AreaPriceTrend.findOne({ city, area });
        } catch (error) {
            throw error;
        }
    },
    getAreaPriceTrendById: async (trendId) => {
        try {
            return await AreaPriceTrend.findOne({ _id: trendId });
        } catch (error) {
            throw error;
        }
    },
    getAreaTrendByNameWhileUpdate: async (priceId, city, area)=> {
        try {
            return await AreaPriceTrend.findOne({_id: {$ne: priceId}, city: city, area: area})
        } catch (error) {
            throw error 
        }
    },
    updateAddAreaPriceTrends : async (priceId, dataToUpdate) => {
        try {
            return await AreaPriceTrend.updateOne({_id: priceId}, {$set : dataToUpdate})
        } catch (error) {
            throw error 
        }
    },
    paginatedAreaTrendList: async (searchString, page)=> {
        try {
            let filter = {};
            // search
            if (searchString) {
                const regex = new RegExp(searchString, "i");
                filter.$or = [
                    { name: regex },
                    { email: regex },
                    { mobile: regex }
                ];
            }
            if (page < 1) page = 1;

            const totalRecords = await AreaPriceTrend.countDocuments(filter);
            const result = await AreaPriceTrend.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
            return {
                totalRecords,
                totalPages: await countPages(totalRecords),
                result
            }
        } catch (error) {
            throw error 
        }
    },
    getAllAreaTrend: async () => {
        try {
            return await AreaPriceTrend.find({}).sort({ city: 1 });
        } catch (error) {
            throw error;
        }
    },
    detailedAreaPriceTrendForPublic : async (id, year)=> {
        try {
            const result = await AreaPriceTrend.aggregate([
                {
                    $match: {_id: new mongoose.Types.ObjectId(id)}
                },
                {
                    $unwind: "$priceTrends"
                },
                {
                    $match: {"priceTrends.year": year}
                },
                // {
                //     $sort: {"priceTrends.monthValue": 1}
                // },
                {
                    $group: {
                        _id: {
                            id: "$_id",
                            city: "$city",
                            area: "$area",
                            year: "$priceTrends.year"
                        },
                        priceTrends: {
                            $push: {
                                month: "$priceTrends.month",
                                monthValue: "$priceTrends.monthValue",
                                price: "$priceTrends.price"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: "$_id.id",
                        city: "$_id.city",
                        area: "$_id.area",
                        year: "$_id.year",
                        priceTrends: 1
                    }
                }
            ]);
            return result[0]; 
        } catch (error) {
            throw error 
        }
    },
    getAreaPriceTrend : async (city, propertyCategory) => {
        const match = {
            status: "approved",
            isActive: true,
            isVerified: true,
            pricePerSqft: { $gt: 0 }
        };

        if (city) {
            match.city = city;
        }

        if (propertyCategory) {
            match.propertyCategory = propertyCategory;
        }
        return await Property.aggregate([
            {
                $match: match
            },

            // Monthly trend
            {
                $group: {
                    _id: {
                        city: "$city",
                        area: "$locality",
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    price: { $avg: "$pricePerSqft" },
                    totalPrice: { $sum: "$pricePerSqft" }, 
                    highestPrice: { $max: "$pricePerSqft" },
                    lowestPrice: { $min: "$pricePerSqft" },
                    propertyCount: { $sum: 1 }
                }
            },

            {
                $sort: {
                    "_id.city": 1,
                    "_id.area": 1,
                    "_id.year": 1,
                    "_id.month": 1
                }
            },

            // Area Summary
            {
                $group: {
                    _id: {
                        city: "$_id.city",
                        area: "$_id.area"
                    },

                    summaryHighest: {
                        $max: "$highestPrice"
                    },

                    summaryLowest: {
                        $min: "$lowestPrice"
                    },

                    totalPrice: {
                        $sum: "$totalPrice"
                    },

                    totalProperties: {
                        $sum: "$propertyCount"
                    },

                    priceTrends: {
                        $push: {
                            year: {
                                $toString: "$_id.year"
                            },
                            monthValue: "$_id.month",
                            month: {
                                $arrayElemAt: [
                                    [
                                        "",
                                        "Jan",
                                        "Feb",
                                        "Mar",
                                        "Apr",
                                        "May",
                                        "Jun",
                                        "Jul",
                                        "Aug",
                                        "Sep",
                                        "Oct",
                                        "Nov",
                                        "Dec"
                                    ],
                                    "$_id.month"
                                ]
                            },
                            price: {
                                $round: ["$price", 0]
                            }
                        }
                    }
                }
            },

            {
                $project: {
                    _id: 0,
                    city: "$_id.city",
                    area: "$_id.area",
                    summary: {
                        price: {$round: [{ $divide: [ "$totalPrice", "$totalProperties" ] }, 0]},
                        highestPrice: "$summaryHighest",
                        lowestPrice: "$summaryLowest",
                        propertyCount: "$totalProperties"
                    },

                    priceTrends: 1
                }
            }
        ]);
    }
};

module.exports = areaPriceTrendService;