const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Function to get current IST time
const getISTTime = () => {
  const now = new Date();
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert UTC to IST
};

const notificationSchema = new mongoose.Schema({
  notiId: { type: Number, unique: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: getISTTime } // Store in IST
});

// Auto Increment Plugin
notificationSchema.plugin(AutoIncrement, { inc_field: 'notiId', start_seq: 112514 });

module.exports = mongoose.model('Notification', notificationSchema);
