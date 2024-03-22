import axios from 'axios';
import { PlayerID } from '../types/CoveyTownSocket';

const addPet = async (data: { type: string; playerID: PlayerID; equipped: boolean }) => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/api/pets`, data);
  const pet = response.data;
  return pet;
};

export default addPet;
