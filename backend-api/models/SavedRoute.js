const mongoose = require('mongoose');

const SavedRouteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startCoords: { type: [Number], required: true }, // [Lat, Lng]
  endCoords: { type: [Number], required: true },
  distanceKm: { type: Number, required: true },
  pointsEarned: { type: Number, required: true },
  savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedRoute', SavedRouteSchema);