import * as petsDao from './pets-dao';

const findAllPets = async (req, res) => {
  try {
    const pets = await petsDao.findAllPets();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching all pets from the inventory' });
  }
};

/*
Search by pet type
*/
const findPetByType = async (req, res) => {
  try {
    const { type } = req.params;
    const pet = await petsDao.findPetByType(type);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pets of a type from the inventory' });
  }
};

/*
Search by playerID
*/
const findPetsByPlayer = async (req, res) => {
  try {
    const { playerID } = req.params;
    const pet = await petsDao.findPetsByPlayer(playerID);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching all pets of the player' });
  }
};

/*
Search by playerID and pet type
*/
const findPetsByPlayerAndType = async (req, res) => {
  try {
    const { playerID, type } = req.params;
    const pet = await petsDao.findPetsByPlayerAndType(playerID, type);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pets of certain type of certain player' });
  }
};

/*
Body Format for createPet
{
    type: { type: String, required: true },
    playerID: { type: Number, required: true },
    equipped: { type: Boolean, default: false },
}

*/
const createPet = async (req, res) => {
  try {
    const pet = await petsDao.createPet(req.body);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error creating pet in the inventory' });
  }
};

const API_BASE_PATH = '/api/pets';

const petsController = app => {
  app.get(API_BASE_PATH, findAllPets);
  app.get(`${API_BASE_PATH}/type/:type`, findPetByType); // FIXME: delete this
  app.get(`${API_BASE_PATH}/player/:playerID`, findPetsByPlayer);
  app.get(`${API_BASE_PATH}/player/:playerID/type/:type`, findPetsByPlayerAndType);
  app.post(API_BASE_PATH, createPet);
  // app.put(`${API_BASE_PATH}/player/:playerID/type/:type`, updatePetEquippedStatus);
};

export default petsController;
