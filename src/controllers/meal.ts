import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { MealModel } from '../models';

export const getAllMeals = async (req: Request, res: Response) => {
  const meals = await MealModel.find({});

  res.json({ meals });
};

export const getMealByDate = async (req: Request, res: Response) => {
  const date = new Date(req.params.date);
  if (Number.isNaN(date.getTime())) throw new HttpException(400, '유효하지 않은 날짜입니다.');

  const meal = await MealModel.findOne({ date });
  if (!meal) throw new HttpException(404, '해당 날짜의 급식 정보가 없습니다.');

  res.json({ meal });
};

export const createMeal = async (req: Request, res: Response) => {
  const meal = new MealModel();
  Object.assign(meal, req.body);

  await meal.save();

  res.json({ meal });
};
