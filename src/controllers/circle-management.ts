import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { CircleModel, UserModel } from '../models';

export const createCircle = async (req: Request, res: Response) => {
  const circle = Object.assign(req.body, {
    imageKey: `CIRCLE_PROFILE/${req.body.name}.png`,
  });

  const chair = await UserModel.findStudentById(circle.chair);
  const viceChair = await UserModel.findStudentById(circle.viceChair);
  if (!chair || !viceChair) throw new HttpException(404, '해당 학생을 찾을 수 없습니다.');

  const newCircle = await CircleModel.create(circle);

  res.json({ circle: newCircle });
};

export const removeCircle = async (req: Request, res: Response) => {
  const circle = await CircleModel.findById(req.params.circleId);
  if (!circle) throw new HttpException(404, '해당 동아리를 찾을 수 없습니다.');
  await circle.remove();
  res.json({ circle });
};
