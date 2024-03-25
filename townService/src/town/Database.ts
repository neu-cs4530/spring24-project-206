import axios from 'axios';
import { PlayerID } from '../types/CoveyTownSocket';

const addPet = async (data: { type: string; playerID: PlayerID; equipped: boolean }) => {
  const response = await axios.post(`http://localhost:8081/api/pets`, data); // FIXME: change url
  const pet = response.data;
  return pet;
};

export default addPet;
