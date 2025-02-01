const express = require("express");
const bcrypt = require("bcryptjs");  // Ensure bcryptjs is used
const User = require("../models/User");  // Ensure correct path

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { fullName, email, phone, password, age } = req.body;

        if (!fullName || !email || !phone || !password || !age) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            phone,
            password: hashedPassword,
            age,
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error registering user" });
    }
});

module.exports = router;
