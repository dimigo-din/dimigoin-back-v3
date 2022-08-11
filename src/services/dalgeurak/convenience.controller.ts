import { Request, Response } from 'express';
import { setConvenienceFood } from '../../resources/dalgeurak';

export const createConvenience = async (req: Request, res: Response) => {
  await setConvenienceFood();
  res.json({});
};
