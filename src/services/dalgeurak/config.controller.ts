import { Request, Response } from 'express';
import { MealConfigModel } from '../../models/dalgeurak';

export const createMealConfig = async (req: Request, res: Response) => {
  const { key, value } = req.body;

  const config = await new MealConfigModel({
    key,
    value,
  }).save();

  res.json({ config });
};
