import * as leaderboardDao from './leaderboard-dao';

const getAllPlayersCurrency = async (req, res) => {
  try {
    const players = await leaderboardDao.getAllPlayersCurrency();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the players in the leaderboard' });
  }
};

const getOnePlayerCurrency = async (req, res) => {
  try {
    const { playerID } = req.params;
    const player = await leaderboardDao.getOnePlayerCurrency(playerID);
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the specific player in the leaderboard' });
  }
};

const incrementOnePlayerCurrency = async (req, res) => {
  try {
    const { playerID } = req.params;
    const { delta } = req.body;
    const player = await leaderboardDao.incrementOnePlayerCurrency(playerID, delta);
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the specific player in the leaderboard' });
  }
};

const addPlayerCurrency = async (req, res) => {
  try {
    const player = await leaderboardDao.createPlayerCurrency(req.body);
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Error adding the new player to the leaderboard' });
  }
};

const API_BASE_PATH = '/api/leaderboard';

const leaderboardController = app => {
  app.get(API_BASE_PATH, getAllPlayersCurrency);
  app.get(`${API_BASE_PATH}/player/:playerID`, getOnePlayerCurrency);
  app.put(`${API_BASE_PATH}/player/:playerID`, incrementOnePlayerCurrency);
  app.post(`${API_BASE_PATH}`, addPlayerCurrency);
};

export default leaderboardController;
