const mongoose = require('mongoose');
const notificationService = require('../../services/notification.service');
const logError = require('../../utils/helper/pino-log-error');

const getNotificationById = async (request, response) => {
  try {
    //Extract data from the request body
    const { id } = request.body;

    // Validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.badRequest('Invalid notification id');
    }

    // Get notification
    const notification = await notificationService.getNotificationById(id);
    //Send error
    if (!notification) {
      return response.notFound('Notification not found');
    }

    return response.success('Notification fetched successfully', notification);
  } catch (error) {
    // store log in error.log file
    logError(error, {
      api: 'getNotificationById',
      req: request,
    });
    return response.error(error);
  }
};

module.exports = getNotificationById;
