import axios from 'axios';
import 'dotenv/config';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AXIOS_BASE_URL ?? 'http://localhost:8081/api',
});

export default instance;
