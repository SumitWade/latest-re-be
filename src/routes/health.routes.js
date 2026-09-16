const { healthCheck } = require('../utils/helper/health-check');

const healthRoutes = require('express').Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Server Health API
 */

/**
 * @swagger
 * /check-server-health:
 *   get:
 *     summary: Get server health Check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server health check data fetched successfully
 */
healthRoutes.get('/check-server-health', healthCheck);

module.exports = healthRoutes;
