const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const moment = require("moment-timezone");

// Function to get IST time
const getISTTime = () => moment.tz("Asia/Kolkata").toISOString();

// Define Football Match Schema
const FootballMatchSchema = new mongoose.Schema(
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

// Apply Auto Increment Plugin for Football Match ID with a Unique Counter
FootballMatchSchema.plugin(AutoIncrement, {
  inc_field: "footballMatchId", // Use a unique counter name
  start_seq: 50010,
});

// ✅ Use `post("save")` to ensure `matchId` is set AFTER auto-increment
FootballMatchSchema.post("save", function (doc, next) {
  if (doc.footballMatchId) {
    doc.matchId = doc.footballMatchId; // Ensure matchId is set correctly
    doc.save(); // Save the document again to reflect matchId
  }
  next();
});

// Middleware for 'findOneAndUpdate' to update 'updatedAt'
FootballMatchSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: getISTTime() });
  next();
});

// Export the model
module.exports = mongoose.model("FootballMatch", FootballMatchSchema);
