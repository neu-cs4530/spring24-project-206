import axios from 'axios';

export const findPetsByPlayerFromDatabase = async playerID => {
  const response = await axios.get(`/api/pets/player/${playerID}`);
  return response.data;
};

export const findPetsInCatalogFromDatabase = async () => {
  const response = await axios.get(`/api/pets-catalog`);
  return response.data;
};

export const findOnePlayerCurrencyFromDatabase = async playerID => {
  const response = await axios.get(`/api/leaderboard/player/${playerID}`);
  const { currency } = response.data;
  return currency;
};

export const findPetImgIdFromDatabase = async type => {
  const response = await axios.get(`/api/pets-catalog/type/${type}`);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { img_id } = response.data;
  return img_id;
};

export const findPetSpeedFromDatabase = async type => {
  const response = await axios.get(`/api/pets-catalog/type/${type}`);
  const { speed } = response.data;
  return speed;
};
