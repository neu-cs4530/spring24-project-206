import axios from 'axios';
import 'dotenv/config';

axios.defaults.baseURL = process.env.AXIOS_BASE_URL;
axios.defaults.baseURL = 'http://localhost:8081/api';

export const addPetToDatabase = async data => {
  const response = await axios.post(`/pets`, data);
  const pet = response.data;
  return pet;
};

export const findPetsByPlayerFromDatabase = async playerID => {
  const response = await axios.get(`/pets/player/${playerID}`);
  return response.data;
};

export const findPetsInCatalogFromDatabase = async () => {
  const response = await axios.get(`/pets-catalog`);
  return response.data;
};

export const findPetPriceFromDatabase = async type => {
  const response = await axios.get(`/pets-catalog/type/${type}`);
  const { price } = response.data;
  return price;
};

export const findAllCurrencyFromDatabase = async () => {
  const response = await axios.get(`/leaderboard`);
  return response.data;
};

export const findOnePlayerCurrencyFromDatabase = async playerID => {
  const response = await axios.get(`/leaderboard/player/${playerID}`);
  const { currency } = response.data;
  return currency;
};

export const addPlayerCurrencyToDatabase = async leaderboardEntry => {
  const response = await axios.post(`/leaderboard`, leaderboardEntry);
  return response.data;
};

export const findPetImgIdFromDatabase = async type => {
  const response = await axios.get(`/pets-catalog/type/${type}`);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { img_id } = response.data;
  return img_id;
};

export const findPetSpeedFromDatabase = async type => {
  const response = await axios.get(`/pets-catalog/type/${type}`);
  const { speed } = response.data;
  return speed;
};
