const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");

// Register Route
router.post("/register", async (req, res) => {
    const { fullName, email, phone, password, avatar } = req.body;

    if (!fullName || !email || !phone || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already registered" });
        }

        const newUser = new User({ fullName, email, phone, password, avatar });
        await newUser.save();

        res.status(201).json({ 
            message: "User registered successfully", 
            user: { 
                userId: newUser.userId, 
                fullName: newUser.fullName, 
                email: newUser.email, 
                phone: newUser.phone,
                avatar: newUser.avatar,
                createdAt: newUser.createdAt 
            } 
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

        if (user.password !== password) {
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

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetToken = resetToken;
        user.tokenExpiry = Date.now() + 5 * 60 * 1000; // 5 min expiry
        await user.save();

        res.status(200).json({ message: "Reset link sent", resetToken });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    try {
        const user = await User.findOne({ resetToken, tokenExpiry: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = newPassword;
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
