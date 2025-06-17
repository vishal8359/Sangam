import mongoose from 'mongoose';

const societySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  residents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model('Society', societySchema);
