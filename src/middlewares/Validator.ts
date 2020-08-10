import { Request, Response, NextFunction } from 'express';
import { ValidationFailException } from '../exceptions';

export default (requiredKeys: string) => (req: Request, res: Response, next: NextFunction) => {
  if (requiredKeys.length === 0) return next();
  const invalidKeys = requiredKeys.split(', ').filter((key) => !Object.hasOwnProperty.call(req.body, key));
  if (invalidKeys.length > 0) {
    throw new ValidationFailException(invalidKeys);
  } else { next(); }
};
