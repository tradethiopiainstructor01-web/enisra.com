const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['general', 'task', 'target'], default: 'general' },
  // Kept for legacy notifications; these may reference different entities depending on the `type`.
  taskId: { type: mongoose.Schema.Types.ObjectId },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
