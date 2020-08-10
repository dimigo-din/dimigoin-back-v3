import { NextFunction, Request, Response } from 'express';
import Token from '../resources/Token';

const TokenManager = new Token();

const attachUserInfo = (req: Request, res: Response, next: NextFunction) => {
  if (!req.token) { return next(); }
  const { token } = req;
  const identity = TokenManager.verify(token);
  req.app.set('user', identity);
  next();
};

export default attachUserInfo;
