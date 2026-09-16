const notificationService = require('../../services/notification.service');
const logError = require('../../utils/helper/pino-log-error');

const getNotificationCount = async (request, response) => {
  try {
    // extract user id from request
    const { _id } = request;

    // get notification count for the user
    const notification = await notificationService.getNotificationCount(_id);
    return response.success('Notification count fetched successfully.', notification);
  } catch (error) {
    // store log in error.log file
    logError(error, {
      api: 'getNotificationCount',
      req: request,
    });
    return response.error(error);
  }
};

module.exports = getNotificationCount;
