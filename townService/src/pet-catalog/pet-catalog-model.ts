import mongoose from 'mongoose';
import petsCatalogSchema from './pet-catalog-schema';

const petsCatalogModel = mongoose.model('pet-shop', petsCatalogSchema);
export default petsCatalogModel;
