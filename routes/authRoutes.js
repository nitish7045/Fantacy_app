const express = require("express");
const router = express.Router();

// Register Route
router.post("/register", (req, res) => {
    const { fullName, email, phone, password, age } = req.body;
    
    if (!fullName || !email || !phone || !password || !age) {
        return res.status(400).json({ message: "All fields are required" });
    }

    res.status(201).json({ message: "User registered successfully", user: req.body });
});

// Login Route
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    res.status(200).json({ message: "Login successful" });
});

module.exports = router;
