const express = require("express")
const addReview = require("../controller/review/add-property-review")
const getPaginatedReviewList = require("../controller/review/get-paginated-review-list")

const userAuthentication = require("../middlewares/auth");
const getPropertyReviewPublic = require("../controller/review/get-property-review-public");
const reviewActiveInactive = require("../controller/review/mark-review-active-inactive");
const addPlatformRating = require("../controller/review/platform-rating");
const getPlatformRating = require("../controller/review/get-platform-rating");
const platformRatingPaginatedList = require("../controller/review/get-platform-rating-paginated-list");
const reviewRoutes = express.Router();
reviewRoutes.post("/add-property-review", userAuthentication, addReview)
reviewRoutes.post("/get-paginated-review-list", userAuthentication, getPaginatedReviewList)
reviewRoutes.post("/active-inactive-review", reviewActiveInactive)

//public review 
reviewRoutes.post("/get-property-review-public", getPropertyReviewPublic)

// platform Rating
reviewRoutes.post("/add-platform-rating", userAuthentication, addPlatformRating)
reviewRoutes.get("/get-platform-rating", getPlatformRating)
reviewRoutes.post("/get-platform-rating-paginated-list",userAuthentication,platformRatingPaginatedList)
module.exports = reviewRoutes;