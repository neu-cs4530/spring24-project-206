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
Search by petID
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

const updatePetEquippedStatus = async (req, res) => {
  try {
    const { type, equipped } = req.body;
    const pet = await petsModel.updateOne({ type }, { $set: { equipped } });

    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const API_BASE_PATH = '/api/pets';

const petsController = app => {
  app.get(API_BASE_PATH, findAllPets);
  app.get(`${API_BASE_PATH}:type`, findPetByType);
  app.post(API_BASE_PATH, createPet);
  app.put(`${API_BASE_PATH}:type`, updatePetEquippedStatus);
};

export default petsController;
