import axios from 'axios';

const URL = 'http://localhost:8081/api'; // FIXME: change url

export const addPet = async data => {
  const response = await axios.post(`${URL}/pets`, data);
  const pet = response.data;
  return pet;
};

export const findPetsByPlayer = async playerID => {
  const response = await axios.get(`${URL}/pets/player/${playerID}`);
  const pets = response.data;
  return pets;
};

export const findPetsInCatalog = async () => {
  const response = await axios.get(`${URL}/pets-catalog`);
  const pets = response.data;
  return pets;
};

export const findPetPrice = async type => {
  const response = await axios.get(`${URL}/pets-catalog`);
  const pets = response.data;
  return pets;
};

export const findAllCurrency = async () => {
  const response = await axios.get(`${URL}/leaderboard`);
  const currencies = response.data;
  return currencies;
};

export const findOnePlayerCurrency = async playerID => {
  const response = await axios.get(`${URL}/leaderboard/player/${playerID}`);
  const { currency } = response.data;
  return currency;
};

export const updateOnePlayerCurrency = async (playerID, updatedValue) => {
  const response = await axios.put(`${URL}/leaderboard/player/${playerID}`, updatedValue);
  const currency = response.data;
  return currency;
};

export const addPlayerCurrency = async leaderboardEntry => {
  const response = await axios.post(`${URL}/leaderboard`, leaderboardEntry);
  const player = response.data;
  return player;
};
