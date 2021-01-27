import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { CircleModel, CircleApplicationModel, UserModel } from '../../models';
import { getUserIdentity } from '../../resources/user';

export const getAllCircles = async (req: Request, res: Response) => {
  const user = await getUserIdentity(req);
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
