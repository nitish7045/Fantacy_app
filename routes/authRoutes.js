const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");
const Team = require("../models/team"); // Import the Team model
const bcrypt = require("bcryptjs"); // Hashing passwords
const moment = require("moment-timezone"); // Timezone conversion
// const moment = require("moment-timezone");
const Wallet = require("../models/wallet");
const Transaction = require('../models/transaction');
const Admin = require('../models/admin');
const FootballMatch = require("../models/FootballMatch");
const CricketMatch =require("../models/CricketMatch");
const MatchResults = require('../models/MatchResults');
// const MatchResults =require("../models/MatchResult");


// Wallet Recharge Route
router.post('/wallet/recharge', async (req, res) => {
  const { userId, amount } = req.body;

  // Validate input
  if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid userId or amount' });
  }

  try {
      // Find the wallet for the user
      let wallet = await Wallet.findOne({ userId });

      if (!wallet) {
          return res.status(404).json({ message: 'Wallet not found' });
      }

      // Update Wallet Balance
      wallet.balance += amount;
      await wallet.save();

      // Create a new Transaction Record
      const transaction = new Transaction({
          userId,
          walletId: wallet.walletId,
          amount,
          transactionType: 'recharge',
          status: 'complete'
      });

      await transaction.save();

      return res.status(200).json({ 
          message: 'Wallet recharged successfully', 
          newBalance: wallet.balance 
      });

  } catch (error) {
      console.error('Error processing recharge:', error);
      return res.status(500).json({ message: 'Server error' });
  }
});

// GET all match results with players' points
router.get('/all-match-results', async (req, res) => {
    try {
      const matchResults = await MatchResults.find().populate('playersPoints'); // Populate players' points if needed
      
      // If no results found
      if (!matchResults.length) {
        return res.status(404).json({
          message: 'No match results found.',
        });
      }
  
      res.status(200).json({
        message: 'Match results retrieved successfully!',
        matchResults,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error retrieving match results',
        error: error.message,
      });
    }
  });
  
// Save match results route
router.post('/save-match-results', async (req, res) => {
    try {
      const {
        matchId,
        seriesName,
        matchTitle,
        matchFormat,
        matchVenue,
        matchDateTime,
        playersPoints
      } = req.body;
  
      // Create a new match result entry
      const matchResult = new MatchResults({
        matchId,
        seriesName,
        matchTitle,
        matchFormat,
        matchVenue,
        matchDateTime,
        playersPoints,
      });
  
      // Save to the database
      await matchResult.save();
  
      // Send a success response
      res.status(201).json({
        message: 'Match results saved successfully!',
        matchResult,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error saving match results',
        error: error.message,
      });
    }
  });

// ✅ Save a new Football Match
router.post("/admin/football/match", async (req, res) => {
    try {
        const newMatch = new FootballMatch(req.body);
        const savedMatch = await newMatch.save();
        res.status(201).json({ message: "Football match added successfully!", match: savedMatch });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Get all Football Matches (Sorted by newest first)
router.get("/admin/football/matches", async (req, res) => {
    try {
        const matches = await FootballMatch.find().sort({ createdAt: -1 }); // Newest first
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// ✅ Get all players Matches (Sorted by newest first)
router.get("/admin/players", async (req, res) => {
    try {
        const matches = await FootballMatch.find().sort({ createdAt: -1 }); // Newest first
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Update a Football Match
router.put("/admin/football/match/:matchId", async (req, res) => {
    try {
        const updatedMatch = await FootballMatch.findOneAndUpdate(
            { matchId: req.params.matchId },  // Find by matchId
            req.body,
            { new: true }
        );

        if (!updatedMatch) {
            return res.status(404).json({ message: "Match not found" });
        }

        res.json({ message: "Match updated successfully", match: updatedMatch });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// ✅ Delete a Football Match
router.delete("/admin/football/match/:matchId", async (req, res) => {
    try {
        const deletedMatch = await FootballMatch.findOneAndDelete({ matchId: req.params.matchId });

        if (!deletedMatch) {
            return res.status(404).json({ message: "Match not found" });
        }

        res.json({ message: "Match deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// ✅ Save a new Cricket Match
router.post("/admin/cricket/match", async (req, res) => {
    try {
        const newMatch = new CricketMatch(req.body);
        const savedMatch = await newMatch.save();
        res.status(201).json({ message: "Cricket match added successfully!", match: savedMatch });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Get all Cricket Matches (Sorted by newest first)
router.get("/admin/cricket/matches", async (req, res) => {
    try {
        const matches = await CricketMatch.find().sort({ createdAt: -1 }); // Newest first
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Update a Cricket Match
router.put("/admin/cricket/match/:matchId", async (req, res) => {
    try {
        const updatedMatch = await CricketMatch.findOneAndUpdate(
            { matchId: req.params.matchId },  // Find by matchId
            req.body,
            { new: true }
        );

        if (!updatedMatch) {
            return res.status(404).json({ message: "Match not found" });
        }

        res.json({ message: "Match updated successfully", match: updatedMatch });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Delete a Cricket Match
router.delete("/admin/cricket/match/:matchId", async (req, res) => {
    try {
        const deletedMatch = await CricketMatch.findOneAndDelete({ matchId: req.params.matchId });

        if (!deletedMatch) {
            return res.status(404).json({ message: "Match not found" });
        }

        res.json({ message: "Match deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Fetch all users (Admin only)
router.get('/admin/fetch-users', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
// Fetch all transaction (Admin only)
router.get('/admin/transaction', async (req, res) => {
    try {
      const transactions = await Transaction.find();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
// Fetch all Wallet (Admin only)
router.get('/admin/wallet', async (req, res) => {
    try {
      const wallets = await Wallet.find();
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
// Fetch all team (Admin only)
router.get('/admin/team', async (req, res) => {
    try {
      const teams = await Team.find();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });


// Register Admin
router.post('/admin/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if admin already exists
      let admin = await Admin.findOne({ email });
      if (admin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new admin
      admin = new Admin({
        username,
        email,
        password: hashedPassword
      });
      
      await admin.save();
      res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
 // Login Admin
router.post('/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check if admin exists
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Compare password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      res.json({ message: 'Login successful', adminId: admin.adminId });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
// Function to get IST time
const getISTTime = () => {
    return moment.tz("Asia/Kolkata").format();
  };

  // Route to get wallet information by userId
router.get('/wallet/:userId', async (req, res) => {
    try {
      const { userId } = req.params;  // Get the userId from the route parameters
  
      // Check if the user exists first
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Fetch the wallet information for the given userId
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
  
      // Return wallet information
      res.json({
        userId: wallet.userId,
        balance: wallet.balance,
        currency: wallet.currency,
        walletId: wallet.walletId,  // You can return the walletId as well
        createdAt:wallet.createdAt,
        updatedAt:wallet.updatedAt,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  
  
  // Route to create wallet for user
  router.post("/create-wallet", async (req, res) => {
    try {
      const { userId } = req.body; // Get userId from AsyncStorage (sent from frontend)
  
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      // Check if wallet already exists
      const existingWallet = await Wallet.findOne({ userId });
  
      if (existingWallet) {
        return res.status(400).json({ message: "Wallet already exists" });
      }
  
      // Create new wallet with bonus balance
      const newWallet = new Wallet({
        userId,
        balance: 200, // Bonus balance
      });
  
      await newWallet.save();
  
      res.status(201).json({ message: "Wallet created successfully", wallet: newWallet });
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });


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

    // Create a new user
    const newUser = new User({
      fullName,
      email: emailLowercase, // Save email in lowercase
      phone,
      password: hashedPassword, // Save hashed password
      avatar: avatar || "", // Optional field
      age, // Save age
    });

    // Save the user to the database
    await newUser.save();

    // Create wallet for the user with ₹200 bonus
    const newWallet = new Wallet({
      userId: newUser.userId, // Use the newly created user's ID
      balance: 200, // Bonus balance
    });

    // Save the wallet to the database
    await newWallet.save();

    // Send the response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: newUser.userId,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        avatar: newUser.avatar,
        age: newUser.age, // Return the age
      },
      wallet: {
        walletId: newWallet.walletId,
        balance: newWallet.balance,
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
//save team by all transaction

router.post('/save-team/new', async (req, res) => {
  const { userId, matchId, team, seriesName, matchTitle, matchFormat, matchDate, sportType, captain, viceCaptain } = req.body;
  const entryFee = 40; // Deduct ₹40 per team creation

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

      // Fetch the user's wallet
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
          return res.status(404).json({ message: "Wallet not found" });
      }

      // Check if the wallet has enough balance
      if (wallet.balance < entryFee) {
          return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Deduct the entry fee from the wallet balance
      wallet.balance -= entryFee;
      await wallet.save();

      // Save transaction
      const transaction = new Transaction({
          userId,
          walletId: wallet.walletId,
          amount: entryFee,
          transactionType: "createTeam",
          status: "complete"
      });

      await transaction.save();

      // Create a new team document
      const newTeam = new Team({
          userId,
          matchId,
          team,
          seriesName,
          matchTitle,
          matchFormat,
          matchDate,
          sportType,
          captain,
          viceCaptain,
      });

      // Save the team to the database
      await newTeam.save();

      // Respond with success message and updated wallet balance
      res.status(201).json({
          message: 'Team saved successfully',
          team: {
              teamId: newTeam.teamId,
              userId: newTeam.userId,
              matchId: newTeam.matchId,
              team: newTeam.team,
              seriesName: newTeam.seriesName,
              matchTitle: newTeam.matchTitle,
              matchFormat: newTeam.matchFormat,
              matchDate: newTeam.matchDate,
              sportType: newTeam.sportType,
              captain: newTeam.captain,
              viceCaptain: newTeam.viceCaptain,
          },
          transaction: {
              transactionId: transaction._id,
              amount: transaction.amount,
              type: transaction.transactionType,
              status: transaction.status
          },
          newWalletBalance: wallet.balance // Return updated wallet balance
      });

  } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
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

  router.get("/teams/team/:teamId", async (req, res) => {
    const { teamId } = req.params;

    try {
        const team = await Team.findOne({ teamId });

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        res.status(200).json({ team });
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

  // GET route to fetch user details by userId
router.get('/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;  // Get the userId from the route parameters
      
      // Find the user by userId
      const user = await User.findOne({ userId });
  
      // If the user is not found, return a 404 error
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Return the user data in the response
      res.json({
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isBlocked: user.isBlocked,
      });
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

  // Route to handle a transaction (recharge, createTeam, withdraw, couponCode, referralMoney)
router.post('/transaction', async (req, res) => {
    const { userId, walletId, amount, transactionType, status } = req.body;
  
    if (!userId || !walletId || !amount || !transactionType || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    // Validate the transaction type
    const validTransactionTypes = ['recharge', 'createTeam', 'withdraw', 'couponCode', 'referralMoney'];
    if (!validTransactionTypes.includes(transactionType)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }
  
    try {
      const transaction = new Transaction({
        userId:userId , // Ensure the userId is an ObjectId
        walletId: walletId, // Ensure the walletId is an ObjectId
        amount,
        transactionType,
        status
      });
  
      // Save the transaction to the database
      const savedTransaction = await transaction.save();
      return res.status(201).json({ message: 'Transaction successful', transaction: savedTransaction });
    } catch (err) {
      console.error('Error saving transaction:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Route to get all transactions for a user
  router.get('/transactions/:userId', async (req, res) => {
    try {
      const userTransactions = await Transaction.find({ userId: req.params.userId }).populate('walletId');
      return res.status(200).json(userTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Route to get a specific transaction by ID
  router.get('/transaction/:transactionId', async (req, res) => {
    const transactionId = parseInt(req.params.transactionId); // Convert the transactionId to an integer
  
    try {
      const transaction = await Transaction.findOne({ transactionId: transactionId }); // Query by integer transactionId
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      return res.status(200).json(transaction);
    } catch (err) {
      console.error('Error fetching transaction:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Register Route
router.post("/register/new", async (req, res) => {
  const { fullName, email, phone, password, avatar, age } = req.body;

  if (!fullName || !email || !phone || !password || !age) {
    return res.status(400).json({ message: "All fields except avatar are required" });
  }

  try {
    // Convert email to lowercase
    const emailLowercase = email.toLowerCase();

    // Check if the user already exists
    const existingUser = await User.findOne({ email: emailLowercase });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      fullName,
      email: emailLowercase,
      phone,
      password: hashedPassword,
      avatar: avatar || "",
      age,
    });

    await newUser.save();

    // Create wallet for the user with ₹200 bonus
    const newWallet = new Wallet({
      userId: newUser.userId, // Use the newly created user's ID
      balance: 200, // Bonus balance
    });

    await newWallet.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: newUser.userId,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        avatar: newUser.avatar,
        age: newUser.age,
      },
      wallet: {
        walletId: newWallet.walletId,
        balance: newWallet.balance,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;