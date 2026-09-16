const addProperties = require('../controller/properties/add-properties');
const addReview = require('../controller/review/add-property-review');
const approveOrRecheckPropertyUpdate = require('../controller/properties/approve-recheck-property');
const getPropertyByObjId = require('../controller/properties/get-property-by-obj-id');
const getPropertyForApproval = require('../controller/properties/get-property-for-approval');
const markPropertyActiveInactive = require('../controller/properties/mark-property-active-inactive');
const propertiesPaginatedList = require('../controller/properties/properties-paginated-list');
const updatePropertyDetails = require('../controller/properties/update-property');
const getAllPropertyList = require('../controller/public/property-page/get-all-property-list');
const getPropertyById = require('../controller/public/property-page/get-property-by-id');
const userAuthentication = require('../middlewares/auth');
const listOfHotsellingProperty = require('../controller/properties/get-paginated-list-of-hotselling-proprty');
const markPropertyAsHotSelling = require('../controller/properties/mark-property-as-hotselling');
const listOfHotsellingPropertyByOwnerId = require('../controller/properties/get-hotselling-property-by-onwer-id');
const markPropertyAsVerified = require('../controller/properties/mark-property-as-verified');
const hotSellingPropertyList = require('../controller/properties/hotselling-property-list');
const getVerifiedProperty = require('../controller/properties/get-count-of-verified-property');
const uploadBulkProperty = require('../controller/properties/bulk-upload-property');
const housingTopPicks = require('../controller/properties/housing-top-picks');
const getLocationDetailsByProjectId = require('../controller/properties/get-location-details-by-project-id');
const updatePropertyActions = require('../controller/properties/update-property-actions');
const getTrendingProperties = require('../controller/properties/get-trending-property-list');
const exportBulkUploadReport = require('../controller/properties/extract-property-failed-records');
const updatePropertyStatusByAdmin = require('../controller/properties/update-property-status-by-admin');
const downloadPropertyTemplate = require('../controller/properties/download-property-template');

const propertyRoutes = require('express').Router();

propertyRoutes.post("/add-property", userAuthentication, addProperties)
propertyRoutes.post("/update-property", userAuthentication, updatePropertyDetails)
propertyRoutes.post("/property-paginated-list", userAuthentication, propertiesPaginatedList)
propertyRoutes.post("/get-property-by-obj-id", userAuthentication, getPropertyByObjId)
propertyRoutes.post("/get-property-for-approval", userAuthentication, getPropertyForApproval)
propertyRoutes.post("/approve-recheck-property", userAuthentication, approveOrRecheckPropertyUpdate)
propertyRoutes.post("/mark-property-active-inactive", userAuthentication, markPropertyActiveInactive)
propertyRoutes.post("/mark-property-as-verified", userAuthentication, markPropertyAsVerified)
propertyRoutes.post("/update-property-actions", userAuthentication, updatePropertyActions)

//hotselling property
propertyRoutes.post("/mark-property-as-hotselling", userAuthentication, markPropertyAsHotSelling)
propertyRoutes.post("/list-of-hotselling-property", listOfHotsellingProperty) //admin 
propertyRoutes.post("/list-of-hotselling-property-by-owner-id", listOfHotsellingPropertyByOwnerId) // owner wise
propertyRoutes.get("/hotselling-property-list", hotSellingPropertyList) // public

// Public Routes
propertyRoutes.post("/get-all-property-list", getAllPropertyList)
propertyRoutes.post("/get-property-by-id", getPropertyById)

// count of verified property
propertyRoutes.get("/count-of-verified-property", getVerifiedProperty)

// bulk upload property
propertyRoutes.post("/upload-bulk-property", userAuthentication, uploadBulkProperty)
propertyRoutes.get("/export-bulk-upload-report", userAuthentication, exportBulkUploadReport)
propertyRoutes.get("/download-property-template", downloadPropertyTemplate)

//housing top picks
propertyRoutes.get("/get-top-housing-picks", housingTopPicks)

propertyRoutes.post("/get-project-location-details",getLocationDetailsByProjectId)

// treanding property

propertyRoutes.post("/get-treanding-properties",getTrendingProperties)

propertyRoutes.post("/get-property-list-status-for-admin",userAuthentication,updatePropertyStatusByAdmin)

module.exports = propertyRoutes;
