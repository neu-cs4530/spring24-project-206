import mongoose from 'mongoose';
import petsCatalogSchema from './pets-catalog-schema.js';

const petsCatalogModel = mongoose.model('pet-shop', petsCatalogSchema);
export default petsCatalogModel;
