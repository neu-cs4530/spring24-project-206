import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    playerID: { type: String, required: true },
    currency: { type: Number, required: true },
  },
  { collection: 'leaderboard' },
);
export default leaderboardSchema;
