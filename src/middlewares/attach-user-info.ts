import { NextFunction, Request, Response } from 'express';
import { verify as verifyToken } from '../resources/token';

const attachUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.token) { return next(); }
  const { token } = req;
  try {
    const identity = await verifyToken(token);
    req.user = identity;
    next();
  } catch (error) {
    return next(error);
  }
};

export default attachUserInfo;
