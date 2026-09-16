const { ObjectId } = require('mongodb');
const Notification = require('../model/notification.model');

const notificationService = {
  getNotificationById: (id) => {
    return Notification.findOne({ _id: new ObjectId(id) });
  },

  deleteNotificationById: (id) => {
    return Notification.deleteOne({ _id: new ObjectId(id) });
  },

  getNotificationCount: (id) => {
    return Notification.countDocuments({
      isSeen: false,
      notificationFor: new ObjectId(id),
    });
  },

  getAllNotification: (id) => {
    return Notification.find({ notificationFor: id }).sort({ createdAt: -1 });
  },

  addMultipleNotification: (notification) => {
    return Notification.insertMany(notification);
  },

  getAllNotificationForUser: async (id) => {
    const count = await Notification.countDocuments({ notificationFor: id, isSeen: false });    
    const result = await Notification.find({ notificationFor: id}).sort({ createdAt: -1 }).lean();
    return {
      count,
      result
    }
  },

  updateNotificationToSeen: (id) => {
    const filter = {
      notificationFor: new ObjectId(id),
      isSeen: false,
    };
    return Notification.updateMany(filter, { $set: { isSeen: true } });
  },

  deleteMultipleNotification: (ids) => {
    const objectIds = ids.map((id) => new ObjectId(id));
    return Notification.deleteMany({ _id: { $in: objectIds } });
  },

  // update notification count
  getNotificationCountAndEmit: async (io, userId) => {
    const unseenCount = await Notification.countDocuments({
      notificationFor: userId,
      isSeen: false,
    });
    io?.to(userId?.toString())?.emit('notificationCount', { count: unseenCount });
  },

  addNotification: (data) => {
    return Notification.create(data);
  },

  createNotificationAndEmit: async (io, payload) => {
    const notification = await Notification.create(payload);
    if (io && payload?.notificationFor) {
      await notificationService.getNotificationCountAndEmit(io, payload.notificationFor.toString());
    }
    return notification;
  },

  bulkNotificationInsertAndEmit: async (io, notifications) => {
    if (!notifications?.length) return;
    await Notification.insertMany(notifications);
    if (io) {
      await Promise.all(
        notifications.map((n) => notificationService.getNotificationCountAndEmit(io, n.notificationFor.toString())),
      );
    }
    return true;
  },
};

module.exports = notificationService;
