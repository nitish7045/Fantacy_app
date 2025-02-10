const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone');

// Function to get current IST time
const getISTTime = () => {
  return moment().tz('Asia/Kolkata').format(); // Ensures IST timezone
};

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: Number, unique: true },
    userId: { type: Number,required:true},
    walletId: { type: Number,required:true},
    amount: { type: Number, required: true },
    transactionType: { 
      type: String, 
      enum: ['recharge', 'createTeam', 'withdraw', 'couponCode', 'referralMoney'], 
      required: true 
    },
    transactionDate: { type: String, default: getISTTime }, // Store IST date as a string
    status: { type: String, enum: ['complete', 'failed', 'processing'], required: true }
  },
  { timestamps: true } // Adds 'createdAt' and 'updatedAt' automatically
);

// Auto Increment Plugin
transactionSchema.plugin(AutoIncrement, { inc_field: 'transactionId', start_seq: 512501 });

// Middleware to update 'updatedAt' field before saving
transactionSchema.pre('save', function (next) {
  this.updatedAt = getISTTime(); // Set 'updatedAt' in IST format
  if (!this.createdAt) {
    this.createdAt = getISTTime(); // Set 'createdAt' only if new
  }
  next();
});

// Middleware to update 'updatedAt' field on updates
transactionSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: getISTTime() }); // Update 'updatedAt' to IST
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
