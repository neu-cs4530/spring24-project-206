import mongoose from 'mongoose';
import petsSchema from './pets-schema.js';

const petsModel = mongoose.model('pet', petsSchema);
export default petsModel;
