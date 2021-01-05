import jwt from 'jsonwebtoken';
import { IUser } from '../interfaces';
import config from '../config';
import { HttpException } from '../exceptions';
import { TokenType } from '../types';

export const getTokenType = async (token: string): Promise<TokenType> => {
  try {
    const payload: any = await jwt.verify(
      token,
      config.jwtSecret as string,
    );
    return (
      payload.refresh
        ? 'REFRESH' : 'ACCESS'
    );
  } catch (error) {
    throw new HttpException(403, '토큰이 정상적으로 검증되지 않았습니다.');
  }
};

export const verify = async (token: string) => {
  try {
    const { identity }: any = await jwt.verify(
      token,
      config.jwtSecret as string,
    );
    return identity;
  } catch (error) {
    throw new HttpException(403, '토큰이 정상적으로 검증되지 않았습니다.');
  }
};

export const issue = async (identity: IUser, refresh: boolean) => {
  if (refresh) {
    const token = await jwt.sign(
      {
        identity: {
          idx: identity.idx,
        },
        refresh: true,
      },
      config.jwtSecret as string,
      {
        algorithm: 'HS512',
        expiresIn: '1M',
      },
    );
    return token;
  }
  const token = await jwt.sign(
    {
      identity,
      refresh: false,
    },
    config.jwtSecret as string,
    {
      algorithm: 'HS512',
      expiresIn: '1w',
    },
  );
  return token;
};
