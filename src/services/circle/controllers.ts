import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { CircleModel, CircleApplicationModel } from '../../models';
import { ConfigKeys, CirclePeriod } from '../../types';
import { getConfig } from '../../resources/config';

export const getAllCircles = async (req: Request, res: Response) => {
  const { user } = req;
  const period = await getConfig(ConfigKeys.circlePeriod);
  if (period === CirclePeriod.submitting) {
    res.json({ circles: [] });
  }
  else if (period === CirclePeriod.registering) {
    const circles = await CircleModel.find()
      .populateTs('chair')
      .populateTs('viceChair');

    const mappedCircles = Promise.all(circles.map((circle) => (circle.description = '')));
    res.json({ circles: mappedCircles });
  }
  else {
    const appliedIds = (await CircleApplicationModel.findByApplier(user._id))
      .map((a) => a.circle.toString());
    const circles = await CircleModel.find()
      .populateTs('chair')
      .populateTs('viceChair');

    const mappedCircles = circles.map((circle) => ({
      ...(circle.toJSON()),
      applied: appliedIds.includes(circle._id.toString()),
    }));
    res.json({ circles: mappedCircles });
  }
};

export const getCircle = async (req: Request, res: Response) => {
  const circle = await CircleModel.findById(req.params.circleId)
    .populateTs('chair')
    .populateTs('viceChair');
  res.json({ circle });
};

export const createCircle = async (req: Request, res: Response) => {
  const circle = await new CircleModel(req.body).save();
  res.json({ circle });
};

export const removeCircle = async (req: Request, res: Response) => {
  const circle = await CircleModel.findById(req.params.circleId);
  if (!circle) throw new HttpException(404, '해당 동아리를 찾을 수 없습니다.');
  await circle.remove();
  res.json({ circle });
};
