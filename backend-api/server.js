require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import our new models
const User = require('./models/User');
const SavedRoute = require('./models/SavedRoute');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected (User Data)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- NEW API ENDPOINTS ---

// 1. Register a new user
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ success: true, message: "User created!", user: newUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 2. Fetch a user's Eco Points profile
app.get('/api/users/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, username: user.username, ecoPoints: user.ecoPoints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});