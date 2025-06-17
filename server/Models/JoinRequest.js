import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  society_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  approved_at: Date,
});

export default mongoose.model('JoinRequest', joinRequestSchema);
