require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB (For Users/Eco-Scores)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected (User Data)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. Connect to PostgreSQL/PostGIS (For Map/Routing Data)
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URI
});

pgPool.connect()
  .then(() => console.log('✅ PostgreSQL Connected (Map Data)'))
  .catch(err => console.error('❌ PostgreSQL Connection Error:', err.stack));

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Green Route AI API is running!');
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});