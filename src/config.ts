import dotenv from 'dotenv';
import path from 'path';

const env = dotenv.config();
if (!env) throw new Error('No env file found');

export default {
  port: process.env.SERVER_PORT!,
  socketPort: process.env.SOCKET_PORT!,
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
  swaggerOpts: {
    openapi: '3.0.0',
    info: {
      title: 'DIMIGOin Backend',
      description: '디미고인 백엔드 v3 API Docs',
    },
    basePath: '/',
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'dev',
      },
      {
        url: 'https://api.dimigo.in',
        description: 'production',
      },
    ],
    schemes: ['http', 'https'],
    securityDefinitions: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        in: 'header',
        bearerFormat: 'JWT',
      },
    },
    consumes: ['application/json'],
    produces: ['application/json'],
  },
};
