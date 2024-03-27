import mongoose from 'mongoose';
import petsSchema from './pets-schema';

const petsModel = mongoose.model('pet', petsSchema);
export default petsModel;
