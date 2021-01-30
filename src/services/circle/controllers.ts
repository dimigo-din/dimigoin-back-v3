import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import * as User from '../../models/user';
import { CircleModel, CircleApplicationModel } from '../../models';

export const getAllCircles = async (req: Request, res: Response) => {
  const { user } = req;
  const applications = await CircleApplicationModel.findByApplier(user._id);
  const appliedIds = await Promise.all(
    applications.map((application) => application.circle.toString()),
  );
  const circleModels = await CircleModel.find()
    .populate('chair', ['name', 'serial'])
    .populate('viceChair', ['name', 'serial']);
  const circles = await Promise.all(circleModels.map((circle) => {
    if (appliedIds.includes(circle._id.toString())) {
      circle.applied = true;
    }
    return circle;
  }));
  res.json({ circles });
};

export const getOneCircle = async (req: Request, res: Response) => {
  const { circleId } = req.params;
  const circle = await CircleModel.findById(circleId)
    .populate('chair', ['name', 'serial'])
    .populate('viceChair', ['name', 'serial']);
  res.json({ circle });
};

export const createCircle = async (req: Request, res: Response) => {
  const chair = await User.model.findStudentById(req.body.chair);
  const viceChair = await User.model.findStudentById(req.body.viceChair);
  if (!chair || !viceChair) throw new HttpException(404, '해당 학생을 찾을 수 없습니다.');

  const circle = await new CircleModel({
    ...req.body,
    image: `CIRCLE_PROFILE/${req.body.name}.png`,
  }).save();
  res.json({ circle });
};

export const removeCircle = async (req: Request, res: Response) => {
  const circle = await CircleModel.findById(req.params.circleId);
  if (!circle) throw new HttpException(404, '해당 동아리를 찾을 수 없습니다.');
  await circle.remove();
  res.json({ circle });
};
