const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// Connect to MongoDB Atlas
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("DB Connection Error:", err));

// Import Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// ✅ Keep-Alive Route for UptimeRobot
app.get("/keep-alive", (req, res) => {
    res.status(200).send("Server is alive!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
