import axios from 'axios';

export const addPet = async data => {
  const response = await axios.post(`http://localhost:8081/api/pets`, data);
  return response.data;
};

export const findPetsByPlayer = async playerID => {
  const response = await axios.get(`http://localhost:8081/api/pets/player/${playerID}`);
  return response.data;
};

export const findPetsInCatalog = async () => {
  const response = await axios.get(`http://localhost:8081/api/pets-catalog`);
  return response.data;
};

export const findPetSpeed = async type => {
  const response = await axios.get(`/pets-catalog/type/${type}`);
  const { speed } = response.data;
  return speed;
};

export const findPetImgId = async type => {
  const response = await axios.get(`/pets-catalog/type/${type}`);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { img_id } = response.data;
  return img_id;
};
