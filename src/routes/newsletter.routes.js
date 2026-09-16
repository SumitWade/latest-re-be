const express = require('express')
const addNewsLetter = require('../controller/newsletter/add-newsletter');
const getNewsletterList = require('../controller/newsletter/get-paginated-newsletter-list');
const newsRoutes = express.Router();


newsRoutes.post("/add-newsletter", addNewsLetter)
newsRoutes.post("/get-newsletter-list", getNewsletterList)

module.exports = newsRoutes