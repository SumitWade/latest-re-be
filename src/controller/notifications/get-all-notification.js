const Notification = require('../../model/notification.model');
const notificationService = require('../../services/notification.service');
const logError = require('../../utils/helper/pino-log-error');

const getAllNotification = async (request, response) => {
  try {
    //extract data from request body
    const { _id } = request;

    //get notification count for the user
    const notification = await notificationService.getAllNotification(_id);
    if (notification) {
      await Notification.updateMany({ notificationFor: _id }, { isSeen: true });
      return response.success('Notification fetched successfully.', notification);
    } else {
      return response.notFound('Notifications not available');
    }
  } catch (error) {
    // store log in error.log file
    logError(error, {
      api: 'getAllNotification',
      req: request,
    });
    return response.error(error);
  }
};

module.exports = getAllNotification;
