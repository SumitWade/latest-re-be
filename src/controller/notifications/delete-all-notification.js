const Notification = require('../../model/notification.model');
const logError = require('../../utils/helper/pino-log-error');

// Function to delete all notifications
const deleteAllNotifications = async (request, response) => {
  try {
    const result = await Notification.deleteMany({});

    // Optional: if no notifications found
    if (result.deletedCount === 0) {
      return response.notFound('No notifications found to delete.');
    }

    //Send success response
    return response.success(`${result.deletedCount} notification(s) have been deleted.`);
  } catch (error) {
    // store log in error.log file
    logError(error, {
      api: 'deleteAllNotifications',
      req: request,
    });
    return response.error(error);
  }
};

module.exports = deleteAllNotifications;
