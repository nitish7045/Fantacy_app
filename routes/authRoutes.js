const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");
const Team = require("../models/team"); // Import the Team model
const bcrypt = require("bcryptjs"); // Hashing passwords
const moment = require("moment-timezone"); // Timezone conversion

// Register Route
router.post("/register", async (req, res) => {
  const { fullName, email, phone, password, avatar, age } = req.body;

  if (!fullName || !email || !phone || !password || !age) {
    return res.status(400).json({ message: "All fields except avatar are required" });
  }

  try {
    // Convert the email to lowercase before checking for an existing user
    const emailLowercase = email.toLowerCase();

    // Check if the user already exists with the lowercase email
    const existingUser = await User.findOne({ email: emailLowercase });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email: emailLowercase, // Save email in lowercase
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
    // Convert email to lowercase to make it case-insensitive
    const user = await User.findOne({ email: email.toLowerCase() });

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

// Save Team Route
router.post('/save-team', async (req, res) => {
    const { userId, matchId, team,seriesName,matchTitle,matchFormat,matchDate,sportType,
        captain,viceCaptain,} = req.body;
  
    // Validate required fields
    if (!userId || !matchId || !team || !Array.isArray(team)) {
      return res.status(400).json({ message: 'userId, matchId, and team (array) are required' });
    }
  
    try {
      // Check if the team already exists for the given matchId and userId
      const existingTeam = await Team.findOne({ userId, matchId });
      if (existingTeam) {
        return res.status(400).json({ message: 'Team already saved for this match' });
      }
  
      // Create a new team document
      const newTeam = new Team({
        userId,
        matchId,
        team,seriesName,matchTitle,matchFormat,matchDate,sportType,
        captain,
        viceCaptain,
      });
  
      // Save the team to the database
      await newTeam.save();
  
      // Respond with success message and saved team data
      res.status(201).json({
        message: 'Team saved successfully',
        team: {
          teamId: newTeam.teamId,
          userId: newTeam.userId,
          matchId: newTeam.matchId,
          team: newTeam.team,
          seriesName:newTeam.seriesName,
          matchTitle:newTeam.matchTitle,
          matchFormat:newTeam.matchFormat,
          matchDate:newTeam.matchDate,
          sportType:newTeam.sportType,
          viceCaptain:newTeam.viceCaptain,
          captain:newTeam.captain,
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

// Get Team by Match ID and User ID
// Get all Teams by User ID
router.get("/teams/:userId", async (req, res) => {
    const { userId } = req.params;
  
    try {
      const teams = await Team.find({ userId });
      
      if (!teams || teams.length === 0) {
        return res.status(404).json({ message: "No teams found" });
      }
  
      res.status(200).json({ teams });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  // ✅ Fetch ALL Transactions (No Limit)
router.get("/all-transactions", async (req, res) => {
    try {
      const transactions = await Transaction.find().sort({ createdAt: -1 });
  
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  
  // ✅ Fetch Transactions of a Specific User
  router.get("/user-transactions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
  
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  
  // ✅ Fetch User, Wallet & Transactions Together
  router.get("/user-details/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
  
      const user = await User.findOne({ userId });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const wallet = await Wallet.findOne({ userId });

      const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
  
      res.json({ user, wallet, transactions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });

  // Update Team, Captain, and Vice-Captain Route
router.post('/update-team', async (req, res) => {
    const { teamId, team, captain, viceCaptain } = req.body;
  
    // Validate required fields
    if (!teamId || !team || !Array.isArray(team) || !captain || !viceCaptain) {
      return res.status(400).json({ message: 'teamId, team (array), captain, and viceCaptain are required' });
    }
  
    try {
      // Find the existing team document by teamId
      const existingTeam = await Team.findOne({ teamId });
  
      if (!existingTeam) {
        return res.status(404).json({ message: 'Team not found' });
      }
  
      // Ensure captain and vice-captain are part of the team
      const playerNames = team.map(player => player.name);
  
      if (!playerNames.includes(captain)) {
        return res.status(400).json({ message: 'Captain must be a selected player in the team.' });
      }
  
      if (!playerNames.includes(viceCaptain)) {
        return res.status(400).json({ message: 'Vice-Captain must be a selected player in the team.' });
      }
  
      // Update the team array, captain, and vice-captain
      existingTeam.team = team; // Update the team array
      existingTeam.captain = captain; // Update the captain
      existingTeam.viceCaptain = viceCaptain; // Update the vice-captain
  
      // Save the updated team document
      await existingTeam.save();
  
      // Respond with success message and updated team data
      res.status(200).json({
        message: 'Team updated successfully',
        team: {
          teamId: existingTeam.teamId,
          userId: existingTeam.userId,
          matchId: existingTeam.matchId,
          team: existingTeam.team,
          seriesName: existingTeam.seriesName,
          matchTitle: existingTeam.matchTitle,
          matchFormat: existingTeam.matchFormat,
          matchDate: existingTeam.matchDate,
          sportType: existingTeam.sportType,
          captain: existingTeam.captain,
          viceCaptain: existingTeam.viceCaptain,
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  

module.exports = router;