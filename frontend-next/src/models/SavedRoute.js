import mongoose from 'mongoose';

const SavedRouteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startCoords: { type: [Number], required: true },
  endCoords: { type: [Number], required: true },
  distanceKm: { type: Number, required: true },
  pointsEarned: { type: Number, required: true },
  savedAt: { type: Date, default: Date.now }
});

export default mongoose.models.SavedRoute || mongoose.model('SavedRoute', SavedRouteSchema);