const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const moment = require("moment-timezone");

// Function to get IST time
const getISTTime = () => moment.tz("Asia/Kolkata").toISOString();

// Define Cricket Match Schema
const CricketMatchSchema = new mongoose.Schema(
  {
    matchId: { type: Number, unique: true }, // Auto-Incremented
    seriesName: { type: String, required: true },
    matchTitle: { type: String, required: true },
    matchFormat: { type: String, required: true },
    matchVenue: { type: String, required: true },
    matchDateTime: { type: Date, required: true },
    teamFlags: {
      team1: { type: String, required: true },
      team2: { type: String, required: true },
    },
    teamAbbreviations: {
      team1: { type: String, required: true },
      team2: { type: String, required: true },
    },
  },
  { timestamps: true }
);

// Apply Auto Increment Plugin for Cricket Match ID with a Unique Counter
CricketMatchSchema.plugin(AutoIncrement, {
  inc_field: "cricketMatchId", // Use a unique counter name
  start_seq: 2020, // Start from a different number to avoid conflicts
});

// ✅ Use `post("save")` to ensure `matchId` is set AFTER auto-increment
CricketMatchSchema.post("save", function (doc, next) {
  if (doc.cricketMatchId) {
    doc.matchId = doc.cricketMatchId; // Ensure matchId is set correctly
    doc.save(); // Save the document again to reflect matchId
  }
  next();
});

// Middleware for 'findOneAndUpdate' to update 'updatedAt'
CricketMatchSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: getISTTime() });
  next();
});

// Export the model
module.exports = mongoose.model("CricketMatch", CricketMatchSchema);
