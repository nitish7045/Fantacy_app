const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserSchema = new mongoose.Schema(
    {
        userId: { type: Number, unique: true }, // Auto-increment user ID
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true }, // Unique email
        phone: { type: String, required: true },
        password: { type: String, required: true },
        avatar: { type: String, default: "" }, // Profile image URL
        isBlocked: { type: Boolean, default: false }, // 0: Active, 1: Blocked
        resetToken: { type: String, default: null }, // Token for password reset
        tokenExpiry: { type: Date, default: null }, // Token expiration time
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" } } // Auto-set timestamps
);

// Auto-increment userId starting from 2025101
UserSchema.plugin(AutoIncrement, { inc_field: "userId", start_seq: 2025101 });

module.exports = mongoose.model("User", UserSchema);
