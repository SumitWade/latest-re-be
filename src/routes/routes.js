const express = require('express');
const notificationRoutes = require('./notification.routes');
const userRoutes = require('./user.routes');
const projectRoutes = require('./project.routes');
const propertyRoutes = require('./property.routes');
const reviewRoutes = require('./review.routes');
const enquiryRoutes = require('./property-enquiry');
const newsRoutes = require('./newsletter.routes');
const contactRoutes = require('./contact.routes');
const wishlistRoutes = require('./wishlist.routes');
const areaPriceTrendRoutes = require('./area-price-trand.routes');
const dashboardRoutes = require('./dashboard.routes');
const chatbotRoutes = require('./chatbot.routes');
const localityRoutes = require('./locality.routes');
const subscriptionPlanRoutes = require('./subscription-plan.routes');

const routes = express.Router();

// Importing all the route files and using them in the main routes file
routes.use('/notification', notificationRoutes);
routes.use('/user', userRoutes);
routes.use('/project', projectRoutes);
routes.use('/property', propertyRoutes);
routes.use("/reviews", reviewRoutes)
routes.use('/enquiry', enquiryRoutes)
routes.use('/newsletter', newsRoutes)
routes.use('/contact', contactRoutes)
routes.use("/wishlist", wishlistRoutes)
routes.use("/area-price-trend", areaPriceTrendRoutes);
routes.use('/dashboard', dashboardRoutes);
routes.use('/chatbot', chatbotRoutes);
routes.use('/locality', localityRoutes);
routes.use('/subscription', subscriptionPlanRoutes);

module.exports = routes;
