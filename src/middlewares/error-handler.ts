import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';
import logger from '../resources/logger';

const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, status = 500, message } = error;
  logger.error(`[${name}]${message}`);
  res.status(status).json({ message });
};

export default errorHandler;
