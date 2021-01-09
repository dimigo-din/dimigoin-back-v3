import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { verify as verifyToken } from '../resources/token';

const attachUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.token) { return next(); }
  const { token } = req;
  try {
    const identity = await verifyToken(token);
    req.app.set('user', identity);
    next();
  } catch (error) {
    return next(
      new HttpException(403, '토큰이 정상적으로 검증되지 않았습니다.'),
    );
  }
};

export default attachUserInfo;
