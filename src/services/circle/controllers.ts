import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { CircleModel, CircleApplicationModel } from '../../models';
import { ConfigKeys, CirclePeriod } from '../../types';
import { getConfig } from '../../resources/config';

export const getAllCircles = async (req: Request, res: Response) => {
  const { user } = req;
  const period = await getConfig(ConfigKeys.circlePeriod);
  if (period === CirclePeriod.registering) {
    res.json({ circles: [] });
  }
  else if (period === CirclePeriod.submitting) {
    const circles = await CircleModel.find()
      .populateTs('chair')
      .populateTs('viceChair');

    const mappedCircles = circles.map((circle) => ({
      ...circle.toObject(),
      description: null,
    }));
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

export const getMyCircle = async (req: Request, res: Response) => {
  const { user } = req;
  const circle = await CircleModel.findByChairs(user._id)
    .populate('chair')
    .populate('viceChair');
  if (!circle) throw new HttpException(403, '동아리장 권한이 없습니다.');

  res.json({
    circle,
  });
};

export const createCircle = async (req: Request, res: Response) => {
  const circle = await new CircleModel(req.body).save();
  res.json({ circle });
};

export const editCircle = async (req: Request, res: Response) => {
  const { user } = req;
  const circle = await CircleModel.findByChairs(user._id)
    .populate('chair')
    .populate('viceChair');
  if (!circle) throw new HttpException(403, '동아리장 권한이 없습니다.');
  Object.assign(circle, req.body);
  await circle.save();
  res.json({ circle });
};

export const removeCircle = async (req: Request, res: Response) => {
  const circle = await CircleModel.findById(req.params.circleId);
  if (!circle) throw new HttpException(404, '해당 동아리를 찾을 수 없습니다.');
  await circle.remove();
  res.json({ circle });
};
