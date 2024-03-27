import petsCatalogModel from './pets-catalog-model';

// get all pets
export const findAllPets = () => petsCatalogModel.find();

// find the pet by its type
export const findPetByType = (type: string) => petsCatalogModel.findOne({ type });

// Find the pet catalog entry with the given type and update its counter by 1
export const updateCounterForPet = async (type: string) => {
  await petsCatalogModel.findOneAndUpdate({ type }, { $inc: { counter: 1 } }, { new: true });
};
