const express = require("express");
const addAreaPriceTrends = require("../controller/area-price-trend/add-area-price-trend");
const updateAddAreaPriceTrends = require("../controller/area-price-trend/update-area-price-trend");
const paginatedAreaTrendList = require("../controller/area-price-trend/paginated-area-trend-list");
const getAreaTrendById = require("../controller/area-price-trend/get-area-price-trend-by-id");
const areaPriceTrendForPublic = require("../controller/area-price-trend/area-price-trend-for-public");
const detailedAreaPriceTrendForPublic = require("../controller/area-price-trend/detailed-area-price-trend-for-public");

const areaPriceTrendRoutes = express.Router();

areaPriceTrendRoutes.post("/add-area-price-trend", addAreaPriceTrends)
areaPriceTrendRoutes.post("/update-area-price-trend", updateAddAreaPriceTrends)
areaPriceTrendRoutes.post("/paginated-area-price-trend", paginatedAreaTrendList)
areaPriceTrendRoutes.post("/get-area-price-trend-by-id", getAreaTrendById)
areaPriceTrendRoutes.post("/area-price-trend-for-public", areaPriceTrendForPublic)
areaPriceTrendRoutes.post("/detailed-area-price-trend-for-public", detailedAreaPriceTrendForPublic)

module.exports = areaPriceTrendRoutes;