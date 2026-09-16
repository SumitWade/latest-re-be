const notificationService = require('../../services/notification.service');
const logError = require('../../utils/helper/pino-log-error');
const { notificationIdsValidation } = require('../../validation/common-validation');

const deleteMultipleNotification = async (request, response) => {
  try {
    //Extract data from request body
    const { notificationIds } = request.body;

    //Validation
    const validationResult = await notificationIdsValidation.validate({ notificationIds });
    if (validationResult?.error) {
      const formattedMessage = validationResult?.error?.details[0]?.message;
      return response.validationError(formattedMessage);
    }

    // check if notificationIds exist in database
    const notificationLength = notificationIds?.length;
    for (let i = 0; i < notificationLength; i++) {
      const notificationId = notificationIds[i];
      const notificationIdsExist = await notificationService.getNotificationById(notificationId);
      if (!notificationIdsExist) {
        return response.notFound('Notifications not found');
      }
    }

    // save data into db and send response
    const result = await notificationService.deleteMultipleNotification(notificationIds);
    if (result?.acknowledged && result?.deletedCount > 0) {
      return response.success('Notifications deleted successfully');
    } else {
      return response.notFound('Failed to deleting notifications');
    }
  } catch (error) {
    // store log in error.log file
    logError(error, {
      api: 'deleteMultipleNotification',
      req: request,
    });
    return response.error(error);
  }
};

module.exports = deleteMultipleNotification;
