const express = require("express");
const createSubscriptionPlan = require("../controller/subscription-model/plan-model/create-subscription-plan");
const updateSubscriptionPlan = require("../controller/subscription-model/plan-model/update-subscription-plan");
const getSubscriptionPlanByObjId = require("../controller/subscription-model/plan-model/get-subscription-plan-id");
const activeInactivePlan = require("../controller/subscription-model/plan-model/active-inactive-plan");
const subscriptionPlanList = require("../controller/subscription-model/plan-model/subscription-plan-list");
const userAuthentication = require("../middlewares/auth");
const purchaseSubscription = require("../controller/subscription-model/purchase-model/purchase-subscription");
const getPurchasedSubscriptionDetails = require("../controller/subscription-model/purchase-model/get-purchased-subscription-details");
const deleteSubscriptionPlan = require("../controller/subscription-model/plan-model/delete-subscription-plan");
const markFeaturedProperty = require("../controller/subscription-model/purchase-model/mark-featured-property");

const subscriptionPlanRoutes = express.Router();

//subscription plan routes
subscriptionPlanRoutes.post("/create-subscription-plan", createSubscriptionPlan)
subscriptionPlanRoutes.post("/update-subscription-plan", updateSubscriptionPlan)
subscriptionPlanRoutes.post("/get-subscription-plan-by-id", getSubscriptionPlanByObjId)
subscriptionPlanRoutes.post("/mark-active-inactive-plan", activeInactivePlan)
subscriptionPlanRoutes.get("/subscription-plan-list", userAuthentication, subscriptionPlanList)
subscriptionPlanRoutes.post("/delete-subscription-plan", deleteSubscriptionPlan)

// purchased subscription
subscriptionPlanRoutes.post("/purchase-subscription", userAuthentication, purchaseSubscription)
subscriptionPlanRoutes.get("/get-purchased-subscription", userAuthentication, getPurchasedSubscriptionDetails)
subscriptionPlanRoutes.post("/mark-property-as-featured", userAuthentication, markFeaturedProperty)

module.exports = subscriptionPlanRoutes