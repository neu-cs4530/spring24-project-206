import petsCatalogModel from './pets-catalog-model';

// Get all pets
export const findAllPets = () => petsCatalogModel.find();

// Find the pet by its type
export const findPetByType = (type: string) => petsCatalogModel.findOne({ type });

// Find the pet catalog entry with the given type and update its counter by 1
export const updateCounterForPet = async (type: string) =>
  petsCatalogModel.findOneAndUpdate({ type }, { $inc: { counter: 1 } }, { new: true });

// Find the price for the given pet type
export const findPetPrice = async (type: string) =>
  petsCatalogModel.findOne({ type }).select('price');
