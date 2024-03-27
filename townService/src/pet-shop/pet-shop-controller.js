import * as petsCatalogDao from './pets-catalog-dao';

const findAllPets = async (req, res) => {
  try {
    const pets = await petsCatalogDao.findAllPets();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the pets in the catalog' });
  }
};

/*
Search by pet type
*/
const findPetByType = async (req, res) => {
  try {
    const { type } = req.params;
    const pet = await petsCatalogDao.findPetByType(type);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the pets of that type' });
  }
};

const incrementCounter = async (req, res) => {
  try {
    const { type } = req.params;
    const pet = await petsCatalogDao.updateCounterForPet(type);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: "Error incrementing the pet's popularity" });
  }
};

const API_BASE_PATH = '/api/pets-catalog';

const petsCatalogController = app => {
  app.get(API_BASE_PATH, findAllPets);
  app.get(`${API_BASE_PATH}/type/:type`, findPetByType);
  app.put(`${API_BASE_PATH}/type/:type`, incrementCounter);
};

export default petsCatalogController;
