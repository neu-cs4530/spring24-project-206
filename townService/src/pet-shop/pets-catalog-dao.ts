import petsCatalogModel from './pets-catalog-model.js';

// get all pets
export const findAllPets = () => petsCatalogModel.find();

// find the pet by its type
export const findPetByType = (type: string) => petsCatalogModel.findOne({ type });

// Find the pet catalog entry with the given type and update its counter by 1
export const updateCounterForPet = async (type: string) => {
  try {
    await petsCatalogModel.findOneAndUpdate({ type }, { $inc: { counter: 1 } }, { new: true });
  } catch (error) {
    console.error('Error updating counter for pet:', error);
    throw error;
  }
};
