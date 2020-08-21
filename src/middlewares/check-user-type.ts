import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';
import Token from '../resources/Token';
import { UserType } from '../types';

const TokenManager = new Token();

const checkUserType = (userType: (UserType[] | '*')) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.token) throw new HttpException(403, '토큰이 없습니다.');
  const { token } = req;
  const identity = TokenManager.verify(token);
  if (userType === '*') return next(); // Route for All Users
  if (userType.includes(identity.userType)) return next();
  throw new HttpException(403, '권한이 없습니다.');
};

export default checkUserType;
