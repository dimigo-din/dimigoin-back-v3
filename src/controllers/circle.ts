import { Request, Response } from 'express';
import { CircleModel, CircleApplicationModel } from '../models';
import { getUserIdentity } from '../resources/user';

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
