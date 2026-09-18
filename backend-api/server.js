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

// 3. Save a route and award Eco Points
app.post('/api/routes/save', async (req, res) => {
  try {
    const { username, startCoords, endCoords, distanceKm } = req.body;
    
    // Find the user we just created
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Award 10 Eco Points per kilometer driven
    const pointsEarned = Math.max(1, Math.floor(distanceKm * 10));

    // Save the route history
    const newRoute = new SavedRoute({
      userId: user._id,
      startCoords,
      endCoords,
      distanceKm,
      pointsEarned
    });
    await newRoute.save();

    // Update the user's total points
    user.ecoPoints += pointsEarned;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: `Route saved! You earned ${pointsEarned} Eco Points.`, 
      totalPoints: user.ecoPoints 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Fetch a user's route history
app.get('/api/routes/history/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Find all routes saved by this user, sorted by newest first
    const history = await SavedRoute.find({ userId: user._id }).sort({ savedAt: -1 });
    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Fetch the global Eco Points Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    // Get the top 10 users with the most ecoPoints
    const topUsers = await User.find({}, 'username ecoPoints')
                               .sort({ ecoPoints: -1 })
                               .limit(10);
    res.status(200).json({ success: true, leaderboard: topUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});