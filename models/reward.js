const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Function to get current IST time
const getISTTime = () => {
  const now = new Date();
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert UTC to IST
};

const rewardSchema = new mongoose.Schema({
  rewardId: { type: Number, unique: true },
  codeId: { type: String, required: true },
  type: { type: String, required: true },
  validTill: { type: Date, required: true },
  createdAt: { type: Date, default: getISTTime } // Store in IST
});

// Auto Increment Plugin
rewardSchema.plugin(AutoIncrement, { inc_field: 'rewardId', start_seq: 612503 });

module.exports = mongoose.model('Reward', rewardSchema);
