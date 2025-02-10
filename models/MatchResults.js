// models/MatchResults.js

const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
  matchId: { type: Number, required: true, unique: true },
  seriesName: { type: String, required: true },
  matchTitle: { type: String, required: true },
  matchFormat: { type: String, required: true },
  matchVenue: { type: String, required: true },
  matchDateTime: { type: Date, required: true },
  resultStatus: { type: String, default: 'Complete' }, // default to 'Pending'
  playersPoints: [
    {
      playerId: { type: Number, required: true },
      playerName: { type: String, required: true },
      team: { type: String, required: true },
      position: { type: String, required: true },
      points: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Automatically update 'updatedAt' field when the document is saved
matchResultSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Export the model
module.exports = mongoose.model('MatchResults', matchResultSchema);
