const notificationService = require('../../services/notification.service');
const logError = require('../../utils/helper/pino-log-error');

const markAllNotificationRead = async (request, response) => {
  try {
    // Extract user id from request
    const { _id } = request;

    // Extract data from the request body
    const {id} = request.body; // user record object id

    if(String(_id) !== String(id)){
        return response.status(400).json({
            status: "FAILED",
            message: "Provided object id mismatch"
        })
    }

    // Get notifications
    const notifications = await notificationService.updateNotificationToSeen(_id);
    if (notifications) {
      // Emit socket for notification count update
      request.io.emit('notificationCount', [_id]);

      return response.status(200).json({
        status: "SUCCESS",
        message: "Notification updated successfully"
      });
    }
    else {
      return response.status(400).json({
        status: "FAILED",
        message : "Failed to update"
      });
    }

  } catch (error) {
    // store log in error.log file
    logError(error, {
      api: 'markAllNotificationRead',
      req: request,
    });
    return response.error(error);
  }
};

module.exports = markAllNotificationRead;
