// server.js (or route handling file)

const express = require('express');
const bcrypt = require('bcrypt');  // For password hashing
const User = require('./models/User');  // Assuming you have a User model to interact with MongoDB
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
    res.send("Fantasy Sports Backend is Running! 🚀");
});

// Register route
app.post("/register", async (req, res) => {
  const { fullName, email, phone, password, age } = req.body;

  // Input validation
  if (!fullName || !email || !phone || !password || !age) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "Email already registered." });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    fullName,
    email,
    phone,
    password: hashedPassword,
    age,
  });

  try {
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
