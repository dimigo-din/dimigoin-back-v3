import { NextFunction, Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { HttpException } from '../exceptions';
import logger from '../resources/logger';

const sendError = (res: Response, status: number, message: string) => {
  res.status(status).json({ message });
};

const errorHandler = (
  error: HttpException | MongoError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  switch (error.name) {
    case 'HttpException': {
      const { name, status = 500, message } = error as HttpException;
      logger.error(`[${name}]${message}`);
      sendError(res, status, message);
      break;
    }
    case 'MongoError': {
      // @ts-ignore
      const { code, keyValue } = error as MongoError;
      const duplicated = Object.keys(keyValue).join(', ');
      if (code === 11000) {
        sendError(res, 404, `'${duplicated}' 항목이 중복되었습니다.`);
      }
      break;
    }
    default: {
      logger.error(JSON.stringify(error));
      sendError(res, 500, '알 수 없는 에러가 발생했습니다.');
      break;
    }
  }
};

export default errorHandler;
