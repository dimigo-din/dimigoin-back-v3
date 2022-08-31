import { Request, Response } from 'express';
import { getOrder } from '../../resources/dalgeurak';
import { HttpException } from '../../exceptions';
import { MealOrderModel } from '../../models/dalgeurak';
import { ClassType } from '../../types';

// 급식 시간 & 순서

export const getMealSequences = async (req: Request, res: Response) => {
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  res.json({ mealSequences });
};
export const getMealTimes = async (req: Request, res: Response) => {
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  res.json({ mealTimes });
};

export const editMealSequences = async (req: Request, res: Response) => {
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  Object.assign(mealSequences, req.body);
  await mealSequences.save();

  res.json({ mealSequences });
};
export const editMealTimes = async (req: Request, res: Response) => {
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  Object.assign(mealTimes, req.body);
  await mealTimes.save();

  res.json({ mealTimes });
};

export const editGradeMealSequences = async (req: Request, res: Response) => {
  interface GradeMealSequences {
    time: 'lunch' | 'dinner';
    sequences: ClassType;
  }

  const gradeIdx = parseInt(req.params.grade) - 1;
  const { time, sequences }: GradeMealSequences = req.body;

  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  mealSequences[time].splice(gradeIdx, 1, sequences);
  Object.assign(mealSequences, {
    ...mealSequences,
  });
  await mealSequences.save();

  res.json({ sequences });
};
export const editGradeMealTimes = async (req: Request, res: Response) => {
  interface GradeMealTimes {
    time: 'lunch' | 'dinner';
    classTimes: ClassType;
  }

  const gradeIdx = parseInt(req.params.grade) - 1;
  const { time, classTimes }: GradeMealTimes = req.body;

  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  mealTimes[time].splice(gradeIdx, 1, classTimes);
  Object.assign(mealTimes, {
    ...mealTimes,
  });
  await mealTimes.save();

  res.json({ classTimes });
};

// 현재 급식 받고 있는 반
export const getNowSequence = async (req: Request, res: Response) => {
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  const { gradeIdx, classIdx, now } = await getOrder();

  res.json({
    nowSequence: mealSequences[now][gradeIdx][classIdx],
    grade: gradeIdx + 1,
  });
};
