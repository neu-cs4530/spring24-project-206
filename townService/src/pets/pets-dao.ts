import { Pet } from '../lib/Pet';
import petsModel from './pets-model';

export const findAllPetsFromDao = () => petsModel.find();

export const createPetFromDao = (pet: Pet) => petsModel.create(pet);

export const findPetsByPlayerFromDao = (playerID: string) => petsModel.find({ playerID });

export const findPetsByPlayerAndTypeFromDao = (playerID: string, type: string) =>
  petsModel.find({ playerID, type });

export const unequipPetInDao = async (playerID: string, type: string) => {
  const updatedPet = await petsModel.findOneAndUpdate(
    { playerID, type }, // Only update if `playerID` and `type` both match
    { equipped: false }, // Set "equipped" to false`
    { new: true },
  );
  return updatedPet;
};

export const equipPetInDao = async (playerID: string, type: string) => {
  const pets = await findPetsByPlayerFromDao(playerID); // list of pets already owned by this player
  pets.forEach(pet => unequipPetInDao(playerID, pet.type));
  const updatedPet = await petsModel.findOneAndUpdate(
    { playerID, type }, // Only update if `playerID` and `type` both match
    { equipped: true }, // Set "equipped" to true
    { new: true },
  );

  return updatedPet;
};

export const deletePetsInDao = async () => petsModel.deleteMany();
