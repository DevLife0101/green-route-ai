import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  ecoPoints: { type: Number, default: 0 }
});

// In serverless, we must check if the model exists before creating it
export default mongoose.models.User || mongoose.model('User', UserSchema);