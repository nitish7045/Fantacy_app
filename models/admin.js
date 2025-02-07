const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone');

const getISTTime = () => {
  return moment.tz('Asia/Kolkata').format(); // Get the current time in IST
};

const adminSchema = new mongoose.Schema(
  {
    adminId: { type: Number, unique: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

// Auto Increment Plugin
adminSchema.plugin(AutoIncrement, { inc_field: 'adminId', start_seq: 312514 });

// Middleware to set IST timestamps on save
adminSchema.pre('save', function (next) {
  this.updatedAt = getISTTime();
  if (!this.createdAt) {
    this.createdAt = getISTTime();
  }
  next();
});

// Middleware to update 'updatedAt' for update operations
adminSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: getISTTime() }); // Update 'updatedAt' to IST
  next();
});

module.exports = mongoose.model('Admin', adminSchema);
