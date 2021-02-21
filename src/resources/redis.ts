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

export const set = async (key: string, value: any) => {
  await client.set(key, value);
};

export const get = async (key: string) => await client.get(key);

export const setHash = async (name: string, key: string, value: any) => {
  await client.hmset(name, key, value);
};

export const getHash = async (name: string, key: string) => await client.hmget(name, key);

export const getAllHashes = async (name: string) => await client.hgetall(name);

export const checkExist = async (key: string) => await client.exists(key);

export const deleteKey = async (key: string) => {
  await client.del(key);
};
