import mongoose from 'mongoose';
import leaderboardSchema from './leaderboard-schema';

const leaderboardModel = mongoose.model('leaderboard', leaderboardSchema);
export default leaderboardModel;
