import axios from 'axios';
import 'dotenv/config';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AXIOS_BASE_URL ?? 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY ?? '',
  },
});

export default instance;
