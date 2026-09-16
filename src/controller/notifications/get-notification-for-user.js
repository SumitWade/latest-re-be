const notificationService = require('../../services/notification.service');
const logError = require('../../utils/helper/pino-log-error');

const getNotificationForUser = async (request, response) => {
  try {
    // Extract user id from request
    const { _id } = request;

    // Get notifications
    const notifications = await notificationService.getAllNotificationForUser(_id);

    // If no notifications found
    if (notifications?.result?.length) {
      // Mark notifications as seen 
      // notificationService.updateNotificationToSeen(_id);

      // Emit socket for notification count update
      request.io.emit('notificationCount', [_id]);

      return response.status(200).json({
        status: "SUCCESS",
        message: "Notification fetched successfully",
        count : notifications.count,
        result: notifications.result,
      });
    }
    else {
      return response.status(400).json({
        status: "FAILED",
        message : "No notifications available"
      });
    }

  } catch (error) {
    // store log in error.log file
    logError(error, {
      api: 'getNotificationForUser',
      req: request,
    });
    return response.error(error);
  }
};

module.exports = getNotificationForUser;
