import mongoose from 'mongoose';
import leaderboardSchema from './leaderboard-schema.js';

const leaderboardModel = mongoose.model('leaderboard', leaderboardSchema);
export default leaderboardModel;
