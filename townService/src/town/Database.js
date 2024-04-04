import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8081/api'; // FIXME: change url

export const addPet = async data => {
  const response = await axios.post(`/pets`, data);
  const pet = response.data;
  return pet;
};

export const findPetsByPlayer = async playerID => {
  const response = await axios.get(`/pets/player/${playerID}`);
  return response.data;
};

export const findPetsInCatalog = async () => {
  const response = await axios.get(`/pets-catalog`);
  return response.data;
};

export const findPetPrice = async type => {
  const response = await axios.get(`/pets-catalog/type/${type}`);
  const { price } = response.data;
  return price;
};

export const findAllCurrency = async () => {
  const response = await axios.get(`/leaderboard`);
  return response.data;
};

export const findOnePlayerCurrency = async playerID => {
  const response = await axios.get(`/leaderboard/player/${playerID}`);
  const { currency } = response.data;
  return currency;
};

export const updateOnePlayerCurrency = async (playerID, updatedValue) => {
  const response = await axios.put(`/leaderboard/player/${playerID}`, updatedValue);
  return response.data;
};

export const addPlayerCurrency = async leaderboardEntry => {
  const response = await axios.post(`/leaderboard`, leaderboardEntry);
  return response.data;
};

export const findPetImgId = async type => {
  const response = await axios.get(`/pets-catalog/type/${type}`);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { img_id } = response.data;
  return img_id;
};
