const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Function to get current IST time
const getISTTime = () => {
  const now = new Date();
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert UTC to IST
};

const teamSchema = new mongoose.Schema({
  teamId: { type: Number, unique: true },
  userId: { type: Number, required: true },
  team: [
    {
    //   id: { type: Number, required: true }, // Player ID
      name: { type: String, required: true }, // Player Name
      position: { type: String, required: true } // Player Position (e.g., All-Rounder)
    }
  ],
  matchId: { type: String, required: true },
  createdAt: { type: Date, default: getISTTime }, // Store in IST
  updatedAt: { type: Date, default: getISTTime }  // Store in IST
});

// Auto Increment Plugin
teamSchema.plugin(AutoIncrement, { inc_field: 'teamId', start_seq: 10001 });

// Middleware to update 'updatedAt' on save
teamSchema.pre('save', function (next) {
  this.updatedAt = getISTTime(); // Update 'updatedAt' with IST time
  next();
});

module.exports = mongoose.model('Team', teamSchema);
