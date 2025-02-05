const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Function to get current IST time
const getISTTime = () => {
  const now = new Date();
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert UTC to IST
};

const transactionSchema = new mongoose.Schema({
  transactionId: { type: Number, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  amount: { type: Number, required: true },
  transactionType: { type: String, enum: ['recharge', 'createTeam', 'withdraw', 'couponCode', 'referralMoney'], required: true },
  transactionDate: { type: Date, default: getISTTime }, // Store in IST for sorting
  status: { type: String, enum: ['complete', 'failed', 'processing'], required: true }
});

// Auto Increment Plugin
transactionSchema.plugin(AutoIncrement, { inc_field: 'transactionId', start_seq: 512501 });

module.exports = mongoose.model('Transaction', transactionSchema);
