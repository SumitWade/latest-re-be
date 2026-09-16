const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
        type: String, required: true,
    },
    description: {
        type: String, required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false,
    },
    notificationFor: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
    },
    recordId: {
        type: String, required: false,
    },
    model: {
      type: String, required: true
    },
    isSeen: {
        type: Boolean, required: true, default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    strict: false,
    versionKey: false,
  },
);

notificationSchema.index({ notificationFor: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
