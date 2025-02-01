const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserSchema = new mongoose.Schema(
    {
        userId: { type: Number, unique: true },
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        password: { type: String, required: true },
        avatar: { type: String, default: "" }, // Optional profile picture
        isBlocked: { type: Boolean, default: false },
        resetToken: { type: String, default: null }, // 6-digit OTP
        tokenExpiry: { type: Number, default: null }, // OTP expiration in UNIX timestamp (seconds)
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

// Auto-increment userId starting from 2025101
UserSchema.plugin(AutoIncrement, { inc_field: "userId", start_seq: 2025101 });

module.exports = mongoose.model("User", UserSchema);
