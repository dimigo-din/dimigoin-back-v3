import dotenv from 'dotenv';
import path from 'path';

const env = dotenv.config();
if (!env) throw new Error('No env file found');

export default {
  port: process.env.SERVER_PORT!,
  mongoUri: process.env.MONGO_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  apiId: process.env.DIMIAPI_ID!,
  apiPw: process.env.DIMIAPI_PW!,
  apiUrl: process.env.DIMIAPI_URL!,
  neisAPIKey: process.env.NEIS_API_KEY!,
  manualCronPassword: process.env.MANUAL_CRON_PASSWORD!,
  fileStoragePath: process.env.NODE_ENV === 'prod'
    ? process.env.FILE_STORAGE_PATH!
    : path.join(path.parse(__dirname).dir, 'exported-files'),
};
