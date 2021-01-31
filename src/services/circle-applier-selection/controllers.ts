import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import * as User from '../../models/user';
import { CircleApplicationModel, CircleModel } from '../../models';
import { ConfigKeys, CirclePeriod } from '../../types';
import { getConfig } from '../../resources/config';

export const getApplications = async (req: Request, res: Response) => {
  const user = req.user;
  const circle = await CircleModel.findByChairs(user._id);

  const applications = await CircleApplicationModel
    .findPopulatedByCircle(circle._id);

  res.json({ applications });
};

export const setApplierStatus = async (req: Request, res: Response) => {
  const applier = await User.model.findById(req.params.applierId);
  if (!applier) throw new HttpException(404, '해당 학생을 찾을 수 없습니다.');

  const user = req.user;
  const circle = await CircleModel.findByChairs(user._id);
  if (!circle) throw new HttpException(403, '권한이 없습니다.');

  const application = await CircleApplicationModel.findByCircleApplier(circle._id, applier._id);
  if (!application) throw new HttpException(404, '해당 지원서를 찾을 수 없습니다.');

  const { status } = req.body;
  const period = await getConfig(ConfigKeys.circlePeriod);

  if ((period === CirclePeriod.application && !status.includes('document'))
      || (period === CirclePeriod.interview && !status.includes('interview'))
      || (period === CirclePeriod.final)) {
    throw new HttpException(400, '현재 해당 상태로 지원서를 변경할 수 없습니다.');
  }
  application.status = status;
  await application.save();
  res.json({ application });
};
