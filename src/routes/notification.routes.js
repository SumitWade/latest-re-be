const deleteNotificationById = require('../controller/notifications/delete-by-id');
const deleteMultipleNotification = require('../controller/notifications/delete-multiple-notification');
const getNotificationCount = require('../controller/notifications/get-notification-count');
const getNotificationForUser = require('../controller/notifications/get-notification-for-user');
const getNotificationById = require('../controller/notifications/get-notification.by.id');
const markAllNotificationRead = require('../controller/notifications/mark-all-notification-read');
const markIndividualNotificationAsRead = require('../controller/notifications/mark-individual-notification-as-read');
const userAuthentication = require("../middlewares/auth");

const notificationRoutes = require('express').Router();

// notificationRoutes.get("/get-all", userAuthentication, getAllNotification)

notificationRoutes.get('/get-notification-count', userAuthentication, getNotificationCount);
notificationRoutes.get('/get-users-notification-list', userAuthentication, getNotificationForUser);
notificationRoutes.post('/get-notification-by-id', getNotificationById);
notificationRoutes.post('/mark-all-notification-read',userAuthentication, markAllNotificationRead);
notificationRoutes.post('/mark-notification-as-read',userAuthentication, markIndividualNotificationAsRead);

//delete notification 
// notificationRoutes.get("/delete-all", userAuthentication, deleteAllNotifications)
notificationRoutes.post('/delete-notification-by-id', deleteNotificationById);
notificationRoutes.post('/delete-multiple-notification', deleteMultipleNotification);


module.exports = notificationRoutes;
