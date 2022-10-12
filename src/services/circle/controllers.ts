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
    const circles = await CircleModel.find();

    const mappedCircles = circles.map((circle) => ({
      ...circle.toObject(),
      notion: null,
    }));
    res.json({ circles: mappedCircles });
  }
  else {
    const appliedIds = (await CircleApplicationModel.findByApplier(user.user_id))
      .map((a) => a.circle.toString());
    const circles = await CircleModel.find();

    const mappedCircles = circles.map((circle) => ({
      ...(circle.toJSON()),
      applied: appliedIds.includes(circle._id.toString()),
    }));
    res.json({ circles: mappedCircles });
  }
};

export const getCircle = async (req: Request, res: Response) => {
  const circle = await CircleModel.findById(req.params.circleId);
  res.json({ circle });
};

export const getMyCircle = async (req: Request, res: Response) => {
  const { user } = req;
  const circle = await CircleModel.findByChairs(user.user_id);
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
  const period = await getConfig(ConfigKeys.circlePeriod);

  if (period === CirclePeriod.submitting) {
    const { user } = req;
    const circle = await CircleModel.findByChairs(user.user_id);
    if (!circle) throw new HttpException(403, '동아리장 권한이 없습니다.');
    Object.assign(circle, req.body);
    await circle.save();
    res.json({ circle });
  }
  else {
    throw new HttpException(403, '변경가능한 상태가 아닙니다.');
  }
};

export const removeCircle = async (req: Request, res: Response) => {
  const circle = await CircleModel.findById(req.params.circleId);
  if (!circle) throw new HttpException(404, '해당 동아리를 찾을 수 없습니다.');
  await circle.remove();
  res.json({ circle });
};
