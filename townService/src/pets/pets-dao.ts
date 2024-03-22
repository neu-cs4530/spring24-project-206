import { Pet } from '../lib/Pet.js';
import petsModel from './pets-model.js';

export const findAllPets = () => petsModel.find();

export const findPetByType = (type: string) => petsModel.find({ type });

export const createPet = (pet: Pet) => petsModel.create(pet);
