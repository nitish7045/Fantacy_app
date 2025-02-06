const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Function to get current IST time
const getISTTime = () => {
  const now = new Date();
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert UTC to IST
};

const walletSchema = new mongoose.Schema({
  walletId: { type: Number, unique: true },
  userId: { type: Number, required: true },
  balance: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: getISTTime }, // Store in IST
  updatedAt: { type: Date, default: getISTTime }  // Store in IST
});

// Auto Increment Plugin
walletSchema.plugin(AutoIncrement, { inc_field: 'walletId', start_seq: 412516 });

// Middleware to update 'updatedAt' before saving
walletSchema.pre('save', function (next) {
  if (!this.isNew) {  // Update only if it's not a new document
    this.updatedAt = getISTTime();  // Store updatedAt in IST
  }
  next();
});

module.exports = mongoose.model('Wallet', walletSchema);
