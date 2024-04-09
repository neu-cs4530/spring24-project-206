import { Pet } from '../lib/Pet';
import petsModel from './pets-model';

// Function to find all pets in the database
export const findAllPets = () => petsModel.find();

// Function to find a pet by its type
export const findPetByType = (type: string) => petsModel.findOne({ type });

// Function to create a new pet in the database
export const createPet = (pet: Pet) => petsModel.create(pet);

// Function to find pets owned by a specific player
export const findPetsByPlayer = (playerID: string) => petsModel.find({ playerID });

// Function to find pets owned by a specific player of a certain type
export const findPetsByPlayerAndType = (playerID: string, type: string) =>
  petsModel.find({ playerID, type });

// Async function to unequip a pet for a specific player
export const unequipPet = async (playerID: string, type: string) => {
  const updatedPet = await petsModel.findOneAndUpdate(
    { playerID, type }, // Only update if `playerID` and `type` both match
    { equipped: false }, // Set "equipped" to false`
    { new: true },
  );
  return updatedPet;
};

// Async function to equip a pet for a specific player
export const equipPet = async (playerID: string, type: string) => {
  const pets = await findPetsByPlayer(playerID); // list of pets already owned by this player
  pets.forEach(pet => unequipPet(playerID, pet.type));
  const updatedPet = await petsModel.findOneAndUpdate(
    { playerID, type }, // Only update if `playerID` and `type` both match
    { equipped: true }, // Set "equipped" to true
    { new: true },
  );

  return updatedPet;
};
