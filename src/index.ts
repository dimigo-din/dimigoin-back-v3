import dotenv from 'dotenv';
import App from './app';
import config from './config';
import logger from './resources/logger';

dotenv.config();

const port: number = parseInt(config.port) || 5000;
const { app } = new App();

app
  .listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  })
  .on('error', (error) => {
    logger.error(error);
  });
