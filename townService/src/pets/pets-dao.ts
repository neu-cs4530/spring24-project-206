import { Pet } from '../lib/Pet';
import petsModel from './pets-model';

export const findAllPets = () => petsModel.find();

export const findPetByType = (type: string) => petsModel.findOne({ type });

export const createPet = (pet: Pet) => petsModel.create(pet);

export const findPetsByPlayer = (playerID: string) => petsModel.find({ playerID });

export const findPetsByPlayerAndType = (playerID: string, type: string) =>
  petsModel.find({ playerID, type });

export const equipPet = (playerID: string, type: string) => {
  const updatedPet = petsModel.findOneAndUpdate(
    { playerID: playerID, type: type }, // Only update if `playerID` and `type` both match
    { equipped: true }, // Remove `uid` from `likedBy` array and decrement `numOfLikes`
    { new: true }
  );
  console.log(updatedPet);
  return updatedPet;
}

export const unequipPet = (playerID: string, type: string) => {
  const updatedPet = petsModel.findOneAndUpdate(
    { playerID: playerID, type: type }, // Only update if `playerID` and `type` both match
    { equipped: false }, // Remove `uid` from `likedBy` array and decrement `numOfLikes`
    { new: true }
  );
  console.log(updatedPet);
  return updatedPet;
}
