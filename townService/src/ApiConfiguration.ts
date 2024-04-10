import axios from 'axios';
import 'dotenv/config';

const instance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_AXIOS_BASE_URL ??
    'https://covey-town-deployment-28400a9c8dfd.herokuapp.com/api',
});

export default instance;
