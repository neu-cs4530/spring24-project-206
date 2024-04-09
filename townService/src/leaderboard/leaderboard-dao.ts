import leaderboardModel from './leaderboard-model';
import { LeaderboardEntry } from '../lib/LeaderboardEntry';

export const getAllPlayersCurrencyFromDao = () => leaderboardModel.find();

export const getOnePlayerCurrencyFromDao = (playerID: string) =>
  leaderboardModel.findOne({ playerID }).select('currency');

export const updateOnePlayerCurrencyInDao = (playerID: string, value: unknown) =>
  leaderboardModel.findOneAndUpdate({ playerID }, { currency: value as number });

export const addPlayerCurrencyToDao = (currencyEntry: LeaderboardEntry) =>
  leaderboardModel.create(currencyEntry);
