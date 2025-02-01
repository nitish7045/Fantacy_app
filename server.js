const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json()); // Middleware to parse JSON

// Sample Register Route
app.post("/register", (req, res) => {
    const { fullName, email, phone, password, age } = req.body;
    
    if (!fullName || !email || !phone || !password || !age) {
        return res.status(400).json({ message: "All fields are required" });
    }

    res.status(201).json({ message: "User registered successfully", user: req.body });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
