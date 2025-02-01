const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs"); // Hashing passwords
const moment = require("moment-timezone"); // Timezone conversion

// Register Route
router.post("/register", async (req, res) => {
    const { fullName, email, phone, password, avatar, age } = req.body;

    if (!fullName || !email || !phone || !password || !age) {
        return res.status(400).json({ message: "All fields except avatar are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already registered" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            phone,
            password: hashedPassword, // Save hashed password
            avatar: avatar || "", // Optional field
            age, // Save age
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            user: {
                userId: newUser.userId,
                fullName: newUser.fullName,
                email: newUser.email,
                phone: newUser.phone,
                avatar: newUser.avatar,
                age: newUser.age, // Return the age
                createdAt: moment(newUser.createdAt).tz("Asia/Kolkata").format(),
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account is blocked" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({ message: "Login successful", userId: user.userId });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate 6-digit OTP
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // Example: "654321"
        const tokenExpiry = Math.floor(Date.now() / 1000) + 300; // Expiry in 5 min (UNIX time in seconds)

        user.resetToken = resetToken;
        user.tokenExpiry = tokenExpiry;
        await user.save();

        // In real-world, send OTP via email/SMS
        res.status(200).json({ message: "OTP sent", resetToken });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: "OTP and new password are required" });
    }

    try {
        const user = await User.findOne({
            resetToken,
            tokenExpiry: { $gt: Math.floor(Date.now() / 1000) }, // Token must not be expired
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.tokenExpiry = null;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


// Block/Unblock Users
router.put("/block/:userId", async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { userId: req.params.userId },
            { isBlocked: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User blocked successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.put("/unblock/:userId", async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { userId: req.params.userId },
            { isBlocked: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User unblocked successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;
