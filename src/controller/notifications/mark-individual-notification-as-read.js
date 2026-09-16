const mongoose = require('mongoose');
const Notification = require('../../model/notification.model');
const logError = require('../../utils/helper/pino-log-error');

const markIndividualNotificationAsRead = async (request, response) => {
  try {
    const { id } = request.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.badRequest('Invalid notification id');
    }

    // Delete notification
    const result = await Notification.findByIdAndUpdate(id, {isSeen: true});
    if (result) {
        return response.success('Notification marked as read');
    }else {
        return response.notFound('Failed to update');
    }

  } catch (error) {
    // store log in error.log file
    logError(error, {
      api: 'markIndividualNotificationAsRead',
      req: request,
    });
    return response.error(error);
  }
};

module.exports = markIndividualNotificationAsRead;
