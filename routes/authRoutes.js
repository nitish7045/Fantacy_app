const bcrypt = require("bcrypt");
const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log("Received Register Request:", req.body); // Log request data

    const { fullName, email, phone, password, age } = req.body;

    // Check if all fields are provided
    if (!fullName || !email || !phone || !password || !age) {
      console.error("Validation Error: Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.error("User Already Exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password Hashed");

    // Create new user
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      age,
    });

    await newUser.save();
    console.log("User Registered Successfully");

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in /register route:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

module.exports = router;
//hrllo