import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';

const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // eslint-disable-next-line
  if (process.env.NODE_ENV === 'develop') console.error(error);

  const { status = 500, message } = error;
  res.status(status).json({ message });
};

export default errorHandler;
