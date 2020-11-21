import { NextFunction, Request, Response } from 'express';

const wrapper = (asyncFn: any) => (async (req: Request, res: Response, next: NextFunction) => {
  try {
    return await asyncFn(req, res, next);
  } catch (error) {
    return next(error);
  }
});

export default wrapper;
