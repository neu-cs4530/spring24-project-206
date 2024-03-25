import axios from 'axios';
import { PlayerID } from '../types/CoveyTownSocket';

export const addPet = async (data: { type: string; playerID: PlayerID; equipped: boolean }) => {
  const response = await axios.post(`http://localhost:8081/api/pets`, data); // FIXME: change url
  const pet = response.data;
  return pet;
};

export const findPetsByPlayer = async (playerID: PlayerID) => {
  const response = await axios.get(`http://localhost:8081/api/pets/player/${playerID}`); // FIXME: change url
  const pets = response.data;
  return pets;
};

export const findPetsInCatalog = async () => {
  const response = await axios.get(`http://localhost:8081/api/pets-catalog`); // FIXME: change url
  const pets = response.data;
  return pets;
};
