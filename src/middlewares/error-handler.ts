import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';
import logger from '../resources/logger';

const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(`[${error.name}]${error.message}`);

  const { status = 500, message } = error;
  res.status(status).json({ message });
};

export default errorHandler;
