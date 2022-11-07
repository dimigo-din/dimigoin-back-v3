/* eslint-disable camelcase */
import jwt from 'jsonwebtoken';
import { PermissionModel, UserTypeModel } from '../models';
import config from '../config';
import { HttpException } from '../exceptions';
import { Gender, TokenType, UserType } from '../types';

interface studentApiLogin {
  id: number;
  username: string;
  email: string;
  name: string;
  nick: string;
  gender: Gender;
  user_type: UserType;
  birthdate: string;
  phone: null;
  status: 10;
  photofile1: null;
  photofile2: null;
  created_at: string;
  updated_at: string;
  password_hash: null;
  sso_token: string;
  dalgeurakFirstLogin: boolean;
}

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
    if (error.name === 'TokenExpiredError') {
      throw new HttpException(401, '토큰이 만료되었습니다.');
    } else if (['jwt malformed', 'invalid signature'].includes(error.message)) {
      throw new HttpException(401, '토큰이 변조되었습니다.');
    } else throw new HttpException(401, '토큰에 문제가 있습니다.');
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
    if (error.name === 'TokenExpiredError') {
      throw new HttpException(401, '토큰이 만료되었습니다.');
    } else if (['jwt malformed', 'invalid signature'].includes(error.message)) {
      throw new HttpException(401, '토큰이 변조되었습니다.');
    } else throw new HttpException(401, '토큰에 문제가 있습니다.');
  }
};

export const issue = async (identity: studentApiLogin, refresh: boolean) => {
  const { type } = await UserTypeModel.findOne({ userId: identity.id });
  const { permissions } = await PermissionModel.findOne({ userId: identity.id });
  const token = await jwt.sign(
    {
      identity: {
        ...identity,
        user_id: identity.id,
        userType: type,
        permissions,
      },
      refresh,
    },
    config.jwtSecret as string,
    {
      algorithm: 'HS512',
      expiresIn: refresh ? '1y' : '1w',
    },
  );
  return token;
};
