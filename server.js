// server.js (Add the POST route)
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User"); // Make sure you have a User model for MongoDB

const app = express();
app.use(cors());
app.use(express.json());

app.post("/register", async (req, res) => {
  const { fullName, email, phone, password, age } = req.body;

  try {
    // Validate the data (add any validation checks)
    if (!fullName || !email || !phone || !password || !age) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Create the new user and save to the database
    const newUser = new User({ fullName, email, phone, password, age });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
