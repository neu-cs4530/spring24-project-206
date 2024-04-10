import * as leaderboardDao from './leaderboard-dao';

/**
 * Get all the players' currency from the leaderboard
 */
const getAllPlayersCurrency = async (req, res) => {
  try {
    const players = await leaderboardDao.getAllPlayersCurrencyFromDao();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the players in the leaderboard' });
  }
};

/**
 * Get one player's currency from the leaderboard
 */
const getOnePlayerCurrency = async (req, res) => {
  try {
    const { playerID } = req.params;
    const currency = await leaderboardDao.getOnePlayerCurrencyFromDao(playerID);
    res.json(currency);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the specific player in the leaderboard' });
  }
};

/**
 * Update one player's currency in the leaderboard
 */
const updateOnePlayerCurrency = async (req, res) => {
  try {
    const { playerID } = req.params;
    const { updatedValue } = req.body;
    const player = await leaderboardDao.updateOnePlayerCurrencyInDao(playerID, updatedValue);
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Error updating the specific player in the leaderboard' });
  }
};

/**
 * Add one player's currency to the leaderboard
 */
const addPlayerCurrency = async (req, res) => {
  try {
    const player = await leaderboardDao.addPlayerCurrencyToDao(req.body);
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Error adding the new player to the leaderboard' });
  }
};

const API_BASE_PATH = '/api/leaderboard';

const leaderboardController = app => {
  app.get(API_BASE_PATH, getAllPlayersCurrency);
  app.get(`${API_BASE_PATH}/player/:playerID`, getOnePlayerCurrency);
  app.put(`${API_BASE_PATH}/player/:playerID`, updateOnePlayerCurrency);
  app.post(`${API_BASE_PATH}`, addPlayerCurrency);
};

export default leaderboardController;
