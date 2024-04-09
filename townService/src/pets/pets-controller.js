import * as petsDao from './pets-dao';

/**
 * Find all pets that are adopted
 */
const findAllPets = async (req, res) => {
  try {
    const pets = await petsDao.findAllPetsFromDao();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching all pets from the inventory' });
  }
};

/**
 * Get all pets that are of the same type
 */
const findPetByType = async (req, res) => {
  try {
    const { type } = req.params;
    const pet = await petsDao.findPetByTypeFromDao(type);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pets of a type from the inventory' });
  }
};

/**
 * Get all pets that belong to one player
 */
const findPetsByPlayer = async (req, res) => {
  try {
    const { playerID } = req.params;
    const pet = await petsDao.findPetsByPlayerFromDao(playerID);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching all pets of the player' });
  }
};

/**
 * Get pets of a particular type that belong to one player
 */
const findPetsByPlayerAndType = async (req, res) => {
  try {
    const { playerID, type } = req.params;
    const pet = await petsDao.findPetsByPlayerAndTypeFromDao(playerID, type);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pets of certain type of certain player' });
  }
};

/**
 * Body Format for createPet
 * {
 *     type: { type: String, required: true },
 *     playerID: { type: Number, required: true },
 *     equipped: { type: Boolean, default: false },
 * }
 *
 */
const createPet = async (req, res) => {
  try {
    const pet = await petsDao.createPetFromDao(req.body);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error creating pet in the inventory' });
  }
};

const API_BASE_PATH = '/api/pets';

const petsController = app => {
  app.get(API_BASE_PATH, findAllPets);
  app.get(`${API_BASE_PATH}/player/:playerID`, findPetsByPlayer);
  app.get(`${API_BASE_PATH}/player/:playerID/type/:type`, findPetsByPlayerAndType);
  app.post(API_BASE_PATH, createPet);
};

export default petsController;
