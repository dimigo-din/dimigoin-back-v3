import redis from 'async-redis';
import logger from './logger';
import config from '../config';

const client = redis.createClient({
  url: config.redisUri,
});

client.on('connect', () => {
  logger.info('Redis server connected');
});

client.on('error', (error) => {
  logger.error(error);
});

export default client;
