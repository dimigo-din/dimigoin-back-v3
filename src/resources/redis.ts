import Redis from 'ioredis';
import { ObjectId } from 'mongodb';
import logger from './logger';
import config from '../config';

enum RedisKeys {
  ingangApplierCount = 'INGANG_APPLIER_COUNT',
}

const client = new Redis(
  config.redisPort,
  config.redisHost,
  { password: config.redisPassword },
);

client.on('connect', () => {
  logger.info('Connected to redis server');
});

export const getAfterschoolApplierCount = async (afterschoolId: ObjectId) => {
  const id = afterschoolId.toHexString();

  return parseInt((await client.hmget(
    RedisKeys.ingangApplierCount,
    id,
  ))[0] || '0');
};

export const mutateAfterschoolApplierCount = async (afterschoolId: ObjectId, amount: number) => {
  const id = afterschoolId.toHexString();
  const applierCount = await getAfterschoolApplierCount(
    afterschoolId,
  );

  await client.hmset(
    RedisKeys.ingangApplierCount,
    id,
    applierCount + amount,
  );
};

export const removeAfterschoolApplierCount = async (afterschool: ObjectId) => {
  const id = afterschool.toHexString();
  await client.hdel(
    RedisKeys.ingangApplierCount,
    id,
  );
};
