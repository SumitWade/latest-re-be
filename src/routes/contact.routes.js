const express = require("express");
const contactRoutes = express.Router();
const addContact = require("../controller/contact/add-contact");
const getPaginatedList = require("../controller/contact/get-paginates-contacts-list");
const userAuthentication = require("../middlewares/auth");
const chngeStatusOfContactEnquiries = require("../controller/contact/change-status-contact-enquiries");

contactRoutes.post("/add-contact", addContact);
contactRoutes.post("/get-paginated-contact-list", userAuthentication, getPaginatedList);
contactRoutes.post("/change-status-of-contact-enquiries", userAuthentication, chngeStatusOfContactEnquiries);
module.exports = contactRoutes;
