const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  signupEnable: { type: Boolean, default: true },
  loginEnable: { type: Boolean, default: true },
  transactionEnable: { type: Boolean, default: true }
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
