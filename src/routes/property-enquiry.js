const express = require('express');
const userAuthentication = require('../middlewares/auth');
const addPropertyEnquiry = require('../controller/property-enquiry/add-property-enquiry');
const propertyEnquiryList = require('../controller/property-enquiry/get-list-of-property-enquiries');
const changeEnquiryStatus = require('../controller/property-enquiry/change-enquiry-status');
const enquiryRoutes = express.Router();
enquiryRoutes.post("/add-property-enquiry", userAuthentication, addPropertyEnquiry)
enquiryRoutes.post("/get-property-enquiry-list", userAuthentication, propertyEnquiryList)
enquiryRoutes.post("/change-enquiry-status", userAuthentication, changeEnquiryStatus)

module.exports = enquiryRoutes;