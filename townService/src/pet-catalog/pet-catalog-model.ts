import mongoose from 'mongoose';
import petCatalogSchema from './pet-catalog-schema';

const petCatalogModel = mongoose.model('pet-shop', petCatalogSchema);
export default petCatalogModel;
