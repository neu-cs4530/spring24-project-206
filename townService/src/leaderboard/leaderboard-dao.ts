import leaderboardModel from './leaderboard-model';
import { LeaderboardEntry } from '../lib/LeaderboardEntry';

export const getAllPlayersCurrency = () => leaderboardModel.find();

export const getOnePlayerCurrency = (playerID: string) =>
  leaderboardModel.findOne({ playerID }).select('currency');

export const updateOnePlayerCurrency = (playerID: string, value: unknown) =>
  leaderboardModel.findOneAndUpdate({ playerID }, { currency: value as number });

export const createPlayerCurrency = (currencyEntry: LeaderboardEntry) =>
  leaderboardModel.create(currencyEntry);
