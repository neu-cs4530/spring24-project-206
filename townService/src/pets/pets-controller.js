import * as petsDao from './pets-dao';
import petsModel from './pets-model';

const findAllPets = async (req, res) => {
  try {
    const pets = await petsDao.findAllPets();
    res.json(pets);
  } catch (error) {
    console.error('Error fetching towns:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/*
Search by petID
*/
const findPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await petsDao.findPetById(id);
    res.json(pet);
  } catch (error) {
    console.error('Error fetching towns:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/*
Body Format for createPet
{
    petID: {type: Number, required: true}, 
    playerID: {type: Number, required: true},
    speed: {type: Number, required: true},
    equipped: {type: Boolean, required: true}
}

*/
const createPet = async (req, res) => {
  try {
    const pet = await petsDao.createPet(req.body);
    res.json(pet);
  } catch (error) {
    console.error('Error fetching towns:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updatePet = async (req, res) => {
  try {
    const { petID } = req.body;
    const { playerID } = req.body;
    const { speed } = req.body;
    const { equipped } = req.body;
    const pet = await petsModel.updateOne({ petID }, { $set: { playerID, speed, equipped } });

    res.json(pet);
  } catch (error) {
    console.error('Error fetching towns:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const PetsController = app => {
  app.get('/api/pets', findAllPets);
  app.get('/api/pets/:id', findPetById);
  app.post('/api/pets', createPet);
  // TODO: do we need to update pet?
};

export default PetsController;
