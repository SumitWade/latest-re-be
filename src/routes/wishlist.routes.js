const express = require("express");
const wishlistRoutes = express.Router();
const addPropertyToWishlist = require("../controller/wishlist/add-property-to-wishlist");
const userAuthentication = require("../middlewares/auth");
const checkPropertyInWishlist = require("../controller/wishlist/check-property-in-wishlist");
const getUserWishlistProperty = require("../controller/wishlist/get-property-in-wishlist-by-user");
const removePropertyFromWishlist = require("../controller/wishlist/remove-property-from-wishlist");

wishlistRoutes.post("/add-property-to-wishlist", userAuthentication, addPropertyToWishlist);
wishlistRoutes.post("/check-property-in-wishlist", userAuthentication, checkPropertyInWishlist);
wishlistRoutes.post("/get-property-in-wishlist-by-user", userAuthentication, getUserWishlistProperty);
wishlistRoutes.post("/remove-property-from-wishlist", userAuthentication, removePropertyFromWishlist);
module.exports = wishlistRoutes;