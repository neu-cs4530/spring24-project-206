import * as petsCatalogDao from './pets-catalog-dao';

/**
 * Find all pets
 */
const findAllPets = async (req, res) => {
  try {
    const pets = await petsCatalogDao.findAllPets();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the pets in the catalog' });
  }
};

/*
 * Search by pet type
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

/**
 * increment pet popularity
 */
export const incrementCounter = async (req, res) => {
  try {
    const { type } = req.params;
    const updatedCounter = await petsCatalogDao.updateCounterForPet(type);
    res.json(updatedCounter);
  } catch (error) {
    res.status(500).json({ error: "Error incrementing the pet's popularity" });
  }
};

/**
 * find the pet's price
 */
export const findPetPrice = async (req, res) => {
  try {
    const { type } = req.params;
    const price = await petsCatalogDao.findPetPrice(type);
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: "Error incrementing the pet's popularity" });
  }
};

const API_BASE_PATH = '/api/pets-catalog';

const petsCatalogController = app => {
  app.get(API_BASE_PATH, findAllPets);
  app.get(`${API_BASE_PATH}/type/:type`, findPetByType);
  app.put(`${API_BASE_PATH}/type/:type`, incrementCounter);
  app.get(`${API_BASE_PATH}/price/type/:type`, findPetPrice);
};

export default petsCatalogController;
