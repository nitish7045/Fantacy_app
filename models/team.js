const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone');

const getISTTime = () => {
  return moment.tz('Asia/Kolkata').format(); // Get the current time in IST
};

// // Function to get current IST time
// const getISTTime = () => {
//   const now = new Date();
//   return new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // Convert UTC to IST
// };

const teamSchema = new mongoose.Schema(
  {
    teamId: { type: Number, unique: true },
    userId: { type: Number, required: true },
    seriesName: { type: String, required: true },
    matchTitle: { type: String, required: true },
    matchFormat: { type: String, required: true },
    matchDate: { type: String, required: true },
    sportType: { type: String, required: true },
    team: [
      {
        name: { type: String, required: true }, // Player Name
        position: { type: String, required: true } // Player Position
      }
    ],
    captain: { type: String, required: true }, // Captain Player Name
    viceCaptain: { type: String, required: true }, // Vice-Captain Player Name
    matchId: { type: String, required: true }
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

// Auto Increment Plugin
teamSchema.plugin(AutoIncrement, { inc_field: 'teamId', start_seq: 10001 });

// Middleware to ensure captain & vice-captain exist in the team
teamSchema.pre('save', function (next) {
  const playerNames = this.team.map(player => player.name);
  
  if (!playerNames.includes(this.captain)) {
    return next(new Error('Captain must be a selected player in the team.'));
  }
  
  if (!playerNames.includes(this.viceCaptain)) {
    return next(new Error('Vice-Captain must be a selected player in the team.'));
  }

  this.updatedAt = getISTTime(); // Set updatedAt to IST time
  if (!this.createdAt) {
    this.createdAt = getISTTime(); // Set createdAt only if new
  }
  next();
});

// Middleware to update 'updatedAt' for update operations
teamSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: getISTTime() }); // Update 'updatedAt' to IST
  next();
});

module.exports = mongoose.model('Team', teamSchema);
