const express = require('express');
const chatbotRoutes = express.Router();
const getChatbotStats = require('../controller/chatbot/get-chatbot-stats');

chatbotRoutes.get('/get-stats', getChatbotStats);

module.exports = chatbotRoutes;
