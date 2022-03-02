import dotenv from 'dotenv';
import path from 'path';

const env = dotenv.config();
if (!env) throw new Error('No env file found');

export default {
  port: process.env.SERVER_PORT!,
  mongoUri: process.env.MONGO_URI!,
  dalgeurakMongoUri: process.env.DALGEURAK_MONGO_URI!,
  dalgeurakKey: process.env.DALGEURAK_KEY!,
  jwtSecret: process.env.JWT_SECRET!,
  apiId: process.env.DIMIAPI_ID!,
  apiPw: process.env.DIMIAPI_PW!,
  apiUrl: process.env.DIMIAPI_URL!,
  neisAPIKey: process.env.NEIS_API_KEY!,
  manualCronPassword: process.env.MANUAL_CRON_PASSWORD!,
  slackWebhookUri: process.env.SLACK_WEBHOOK_URI!,
  redisHost: process.env.REDIS_HOST!,
  redisPort: parseInt(process.env.REDIS_PORT!),
  redisPassword: process.env.REDIS_PASSWORD!,
  fileStoragePath: process.env.NODE_ENV === 'prod'
    ? process.env.FILE_STORAGE_PATH!
    : path.join(path.parse(__dirname).dir, 'exported-files'),
};
