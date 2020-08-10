import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions';

const errorHandler = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'develop') {
    console.error(error); // eslint-disable-line
  }

  const { status = 500, message } = error;
  res.status(status).json({ message });
};

export default errorHandler;
