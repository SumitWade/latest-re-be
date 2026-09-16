const mongoose = require('mongoose');
const Notification = require('../../model/notification.model');
const logError = require('../../utils/helper/pino-log-error');

const deleteNotificationById = async (request, response) => {
  try {
    const { id } = request.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.badRequest('Invalid notification id');
    }

    // Delete notification
    const result = await Notification.findByIdAndDelete(id);

    // Check if notification exists
    if (!result) {
      return response.notFound('Notification not found.');
    }

    return response.success('Notification has been deleted.');
  } catch (error) {
    // store log in error.log file
    logError(error, {
      api: 'deleteNotificationById',
      req: request,
    });
    return response.error(error);
  }
};

module.exports = deleteNotificationById;
