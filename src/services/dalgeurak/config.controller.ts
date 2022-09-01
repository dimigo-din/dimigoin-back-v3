import { Request, Response } from 'express';
import { getMealConfig } from '../../resources/dalgeurak';
import { HttpException } from '../../exceptions';
import { MealConfigModel } from '../../models/dalgeurak';
import { aramark, MealConfigKeys } from '../../types';

export const createMealConfig = async (req: Request, res: Response) => {
  const { key, value } = req.body;

  const config = await new MealConfigModel({
    key,
    value,
  }).save();

  res.json({ config });
};

export const updateStayMealPrice = async (req: Request, res: Response) => {
  const { price } = req.body;

  if (req.user.username !== aramark) throw new HttpException(401, '권한이 부족합니다.');

  await MealConfigModel.updateOne(
    { key: MealConfigKeys.stayMealPrice },
    { value: price },
  );

  res.json({ price });
};
export const getStayMealPrice = async (req: Request, res: Response) => {
  const price = await getMealConfig(MealConfigKeys.stayMealPrice);

  res.json({ price });
};
