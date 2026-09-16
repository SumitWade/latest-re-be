const express = require('express');
const dashboardRoutes = express.Router();
const getCardsStats = require('../controller/dashboard/get-cards-stats');
const userAuthentication = require('../middlewares/auth');
const totalEnquiries = require('../controller/dashboard/get-details-of-project-property-enuiry');
const getLocalitiesWiseProjectProperty = require('../controller/dashboard/get-project-property-localities');
const getPropertiesCategoriesCount = require('../controller/dashboard/get-properties-categories-count');
const getDashboardTablesData = require('../controller/dashboard/get-dashboard-tables-data');

const getTablesCount = require('../controller/dashboard/get-tables-count');

dashboardRoutes.get('/get-card-stats', userAuthentication, getCardsStats);
dashboardRoutes.get("/get-enquiry-details", userAuthentication, totalEnquiries);
dashboardRoutes.get("/get-localities-wise-project-property", userAuthentication, getLocalitiesWiseProjectProperty);
dashboardRoutes.get("/get-category-wise-property", userAuthentication, getPropertiesCategoriesCount)
dashboardRoutes.post("/get-tables-data", userAuthentication, getDashboardTablesData);
dashboardRoutes.get("/get-tables-count", userAuthentication, getTablesCount);

module.exports = dashboardRoutes;