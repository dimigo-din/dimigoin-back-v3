import { NextFunction, Request, Response } from 'express';
import { verify as verifyToken } from '../resources/token';

const attachUserInfo = (req: Request, res: Response, next: NextFunction) => {
  if (!req.token) { return next(); }
  const { token } = req;
  const identity = verifyToken(token);
  res.locals.user = identity;
  next();
};

export default attachUserInfo;
