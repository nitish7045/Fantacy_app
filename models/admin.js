const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Function to get current IST time
const getISTTime = () => {
  const now = new Date();
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert UTC to IST
};

const adminSchema = new mongoose.Schema({
  adminId: { type: Number, unique: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: getISTTime }, // Store in IST
  updatedAt: { type: Date, default: getISTTime }
});

// Auto Increment Plugin
adminSchema.plugin(AutoIncrement, { inc_field: 'adminId', start_seq: 312514 });

// Middleware to update 'updatedAt' on save
adminSchema.pre('save', function (next) {
  this.updatedAt = getISTTime();
  next();
});

module.exports = mongoose.model('Admin', adminSchema);
