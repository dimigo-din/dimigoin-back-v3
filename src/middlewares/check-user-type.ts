import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { verify as verifyToken, getTokenType } from '../resources/token';
import { UserType } from '../types';

const checkUserType = (...userTypes: ((UserType | '*')[])) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.token) return next(new HttpException(403, '토큰이 없습니다.'));
    const { token } = req;
    const tokenType = await getTokenType(token);
    if (tokenType !== 'ACCESS') {
      return next(
        new HttpException(403, '액세스 토큰이 아닙니다.'),
      );
    }
    const identity = await verifyToken(token);
    if (userTypes[0] === '*') return next(); // Route for All Users
    if (userTypes.includes(identity.userType)) return next();
    return next(new HttpException(403, '권한이 없습니다.'));
  };

export default checkUserType;
