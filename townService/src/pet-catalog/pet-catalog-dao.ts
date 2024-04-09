import petsCatalogModel from './pet-catalog-model';

export const findAllPetsFromDao = () => petsCatalogModel.find();

export const findPetByTypeFromDao = (type: string) => petsCatalogModel.findOne({ type });

export const updateCounterForPetInDao = async (type: string) =>
  petsCatalogModel.findOneAndUpdate({ type }, { $inc: { counter: 1 } }, { new: true });

export const findPetPriceFromDao = async (type: string) =>
  petsCatalogModel.findOne({ type }).select('price');
