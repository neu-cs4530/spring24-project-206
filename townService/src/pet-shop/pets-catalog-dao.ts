import petsCatalogModel from './pets-catalog-model.js';

export const findAllPets = () => petsCatalogModel.find();

export const findPetByType = (type: string) => petsCatalogModel.findOne({ type });

export const updateCounterForPet = (type: string) =>
  petsCatalogModel.updateOne({ type }, { $inc: { counter: 1 } });
