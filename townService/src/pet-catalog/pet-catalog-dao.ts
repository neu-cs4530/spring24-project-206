import petCatalogModel from './pet-catalog-model';

export const findAllPetsFromDao = () => petCatalogModel.find();

export const findPetByTypeFromDao = (type: string) => petCatalogModel.findOne({ type });

export const updateCounterForPetInDao = async (type: string) =>
  petCatalogModel.findOneAndUpdate({ type }, { $inc: { counter: 1 } }, { new: true });

export const findPetPriceFromDao = async (type: string) =>
  petCatalogModel.findOne({ type }).select('price');
