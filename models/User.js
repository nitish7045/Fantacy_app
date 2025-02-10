const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const moment = require('moment-timezone');

const getISTTime = () => {
  return moment.tz('Asia/Kolkata').format(); // Get the current time in IST
};

const UserSchema = new mongoose.Schema(
  {
    userId: { type: Number, unique: true },
    age: { 
        type: Number, 
        required: true,
        min: 18, // Optional validation: age must be at least 18
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" }, // Optional profile picture
    isBlocked: { type: Boolean, default: false },
    resetToken: { type: String, default: null }, // 6-digit OTP
    tokenExpiry: { type: Number, default: null }, // OTP expiration in UNIX timestamp (seconds)
  },
  { 
    timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" }
  }
);

// Middleware to set IST time on create and update operations
UserSchema.pre('save', function(next) {
  const currentISTTime = getISTTime();
  
  // Set createdAt and modifiedAt to IST time if they are not set
  if (!this.createdAt) {
    this.createdAt = currentISTTime;
  }
  this.modifiedAt = currentISTTime; // Always update modifiedAt with IST time
  
  next();
});

// Auto-increment userId starting from 2025101
UserSchema.plugin(AutoIncrement, { inc_field: "userId", start_seq: 2025101 });

module.exports = mongoose.model("User", UserSchema);
