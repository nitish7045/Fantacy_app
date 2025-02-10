const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone');

// Function to get current IST time
const getISTTime = () => {
  return moment.tz('Asia/Kolkata').format(); // Get the current time in IST
};

const walletSchema = new mongoose.Schema(
  {
    walletId: { type: Number, unique: true },
    userId: { type: Number, required: true },
    balance: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

// Auto Increment Plugin
walletSchema.plugin(AutoIncrement, { inc_field: 'walletId', start_seq: 412516 });

// Middleware to ensure timestamps are in IST before saving
walletSchema.pre('save', function (next) {
  const currentISTTime = getISTTime();
  this.updatedAt = currentISTTime; // Always update 'updatedAt' to IST
  if (this.isNew) {
    this.createdAt = currentISTTime; // Set 'createdAt' only for new documents
  }
  next();
});

// Middleware to update 'updatedAt' for update operations
walletSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: getISTTime() }); // Update 'updatedAt' to IST
  next();
});

module.exports = mongoose.model('Wallet', walletSchema);