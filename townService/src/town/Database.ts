import axios from 'axios';

const addPet = async (data: { type: string; playerID: string; equipped: boolean }) => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_TOWN_DATABASE_URL}/api/pets`, data);
  const pet = response.data;
  return pet;
};

export default addPet;
