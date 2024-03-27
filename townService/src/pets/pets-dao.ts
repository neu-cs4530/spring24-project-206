import { Pet } from '../lib/Pet';
import petsModel from './pets-model';

export const findAllPets = () => petsModel.find();

export const findPetByType = (type: string) => petsModel.findOne({ type });

export const createPet = (pet: Pet) => petsModel.create(pet);

export const findPetsByPlayer = (playerID: string) => petsModel.find({ playerID });

export const findPetsByPlayerAndType = (playerID: string, type: string) =>
  petsModel.find({ playerID, type });

// export const updatePetEquippedStatus = (playerID: string, type: string) => petsModel.updateOne({ type }, { $set: { equipped } }); //TODO: PLS
