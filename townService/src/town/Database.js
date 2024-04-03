import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8081/api'; // FIXME: change url

export const addPet = async data => {
  const response = await axios.post(`/pets`, data);
  const pet = response.data;
  return pet;
};

export const findPetsByPlayer = async playerID => {
  const response = await axios.get(`/pets/player/${playerID}`);
  const pets = response.data;
  return pets;
};

export const findPetsInCatalog = async () => {
  const response = await axios.get(`/pets-catalog`);
  const pets = response.data;
  return pets;
};

export const findPetPrice = async type => {
  const response = await axios.get(`/pets-catalog/type/${type}`);
  const pets = response.data;
  return pets;
};

export const findAllCurrency = async () => {
  const response = await axios.get(`/leaderboard`);
  const currencies = response.data;
  return currencies;
};

export const findOnePlayerCurrency = async playerID => {
  const response = await axios.get(`/leaderboard/player/${playerID}`);
  const { currency } = response.data;
  return currency;
};

export const updateOnePlayerCurrency = async (playerID, updatedValue) => {
  const response = await axios.put(`/leaderboard/player/${playerID}`, updatedValue);
  const oldPlayer = response.data;
  return oldPlayer;
};

export const addPlayerCurrency = async leaderboardEntry => {
  const response = await axios.post(`/leaderboard`, leaderboardEntry);
  const player = response.data;
  return player;
};
