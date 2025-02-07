const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require('cors');

const app = express(); // ✅ Define app BEFORE using it

// Middleware
app.use(cors({
    origin: '*', // Allow all origins (for now)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ✅ Connect to MongoDB Atlas
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Connection Error:", err));

// ✅ Import & Use Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// ✅ Keep-Alive Route for UptimeRobot (Prevent Auto-Sleep)
app.get("/keep-alive", (req, res) => {
    res.status(200).send("Server is alive!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
