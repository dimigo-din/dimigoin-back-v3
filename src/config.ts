import dotenv from 'dotenv';

const env = dotenv.config();
if (!env) throw new Error('No env file found');

export default {
  port: process.env.SERVER_PORT,
  mongoId: process.env.MONGO_ID,
  mongoPw: process.env.MONGO_PW,
  mongoPort: process.env.MONGO_PORT,
  mongoName: process.env.MONGO_NAME,
  jwtSecret: process.env.JWT_SECRET,
  apiId: process.env.DIMIAPI_ID,
  apiPw: process.env.DIMIAPI_PW,
  apiUrl: process.env.DIMIAPI_URL
}
