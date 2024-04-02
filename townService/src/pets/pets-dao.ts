import { Pet } from '../lib/Pet';
import petsModel from './pets-model';

export const findAllPets = () => petsModel.find();

export const findPetByType = (type: string) => petsModel.findOne({ type });

export const createPet = (pet: Pet) => petsModel.create(pet);

export const findPetsByPlayer = (playerID: string) => petsModel.find({ playerID });

export const findPetsByPlayerAndType = (playerID: string, type: string) =>
  petsModel.find({ playerID, type });

export const equipPet = async (playerID: string, type: string) => {
  const pets = await findPetsByPlayer(playerID); // list of pets already owned by this player
  await pets.map(async (pet: any) => await unequipPet(playerID, pet.type));
  const updatedPet = await petsModel.findOneAndUpdate(
    { playerID: playerID, type: type }, // Only update if `playerID` and `type` both match
    { equipped: true }, // Set "equipped" to true
    { new: true },
  );
  console.log('EQUIP ' + type);
  console.log(updatedPet);
  return updatedPet;
};

export const unequipPet = async (playerID: string, type: string) => {
  const updatedPet = await petsModel.findOneAndUpdate(
    { playerID: playerID, type: type }, // Only update if `playerID` and `type` both match
    { equipped: false }, // Set "equipped" to false`
    { new: true },
  );
  console.log('UNEQUIP ' + type);
  console.log(updatedPet);
  return updatedPet;
};
