import { Pet } from '../lib/Pet.js';
import petsModel from './pets-model.js';

export const findAllPets = () => petsModel.find();

export const findPetById = (id: number) => petsModel.find({ petID: id });

export const createPet = (pet: Pet) => petsModel.create(pet);
