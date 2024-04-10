import * as petCatalogDao from './pet-catalog-dao';

/**
 * Find all pets in the pets catalog
 */
const findAllPets = async (req, res) => {
  try {
    const pets = await petCatalogDao.findAllPetsFromDao();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the pets in the catalog' });
  }
};

/*
 * Search by pet type in the pets catalog
 */
const findPetByType = async (req, res) => {
  try {
    const { type } = req.params;
    const pet = await petCatalogDao.findPetByTypeFromDao(type);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the pets of that type' });
  }
};

/**
 * Increment pet popularity in the pets catalog
 */
export const incrementCounter = async (req, res) => {
  try {
    const { type } = req.params;
    const updatedCounter = await petCatalogDao.updateCounterForPetInDao(type);
    res.json(updatedCounter);
  } catch (error) {
    res.status(500).json({ error: "Error incrementing the pet's popularity" });
  }
};

/**
 * Find the pet's price from the pets catalog
 */
export const findPetPrice = async (req, res) => {
  try {
    const { type } = req.params;
    const price = await petCatalogDao.findPetPriceFromDao(type);
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: "Error incrementing the pet's popularity" });
  }
};

const API_BASE_PATH = '/api/pets-catalog';

const petCatalogController = app => {
  app.get(API_BASE_PATH, findAllPets);
  app.get(`${API_BASE_PATH}/type/:type`, findPetByType);
  app.put(`${API_BASE_PATH}/type/:type`, incrementCounter);
  app.get(`${API_BASE_PATH}/price/type/:type`, findPetPrice);
};

export default petCatalogController;
