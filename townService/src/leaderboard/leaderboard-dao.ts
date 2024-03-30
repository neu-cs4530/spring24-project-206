import leaderboardModel from './leaderboard-model.js';
import { LeaderboardEntry } from '../lib/LeaderboardEntry';

export const getAllPlayersCurrency = () => leaderboardModel.find();

export const getOnePlayerCurrency = (playerID: string) => leaderboardModel.findOne({ playerID });

export const updateOnePlayerCurrency = (playerID: string, delta: unknown) =>
  leaderboardModel.updateOne({ playerID }, { $set: { counter: delta as number } });

export const createPlayerCurrency = (currencyEntry: LeaderboardEntry) =>
  leaderboardModel.create(currencyEntry);
