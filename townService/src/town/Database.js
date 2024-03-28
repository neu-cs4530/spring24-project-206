import axios from 'axios';

export const addPet = async data => {
  const response = await axios.post(`http://localhost:8081/api/pets`, data); // FIXME: change url
  return response.data;
};

export const findPetsByPlayer = async playerID => {
  const response = await axios.get(`http://localhost:8081/api/pets/player/${playerID}`); // FIXME:
  // change
  // url
  return response.data;
};

export const findPetsInCatalog = async () => {
  const response = await axios.get(`http://localhost:8081/api/pets-catalog`); // FIXME: change url
  return response.data;
};
