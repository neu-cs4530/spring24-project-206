import * as petsDao from './pets-dao';
import petsModel from './pets-model';

const findAllPets = async (req, res) => {
  try {
    const pets = await petsDao.findAllPets();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
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
    res.status(500).json({ error: 'Internal Server Error' });
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
    res.status(500).json({ error: 'Internal Server Error' });
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
    res.status(500).json({ error: 'Internal Server Error' });
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// const updatePetEquippedStatus = async (req, res) => {
//   try {
//     const { type, equipped } = req.body; // FIXME: add playerID
//     const pet = await petsDao.updatePetEquippedStatus(playerID, type);

//     res.json(pet);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

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
