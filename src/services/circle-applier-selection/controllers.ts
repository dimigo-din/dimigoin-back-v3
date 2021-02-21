import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { CircleApplicationModel, CircleModel } from '../../models';
import { ConfigKeys, CirclePeriod } from '../../types';
import { getConfig } from '../../resources/config';

export const getApplications = async (req: Request, res: Response) => {
  const { user } = req;
  const circle = await CircleModel.findByChairs(user._id);
  if (!circle) throw new HttpException(403, '동아리장 권한이 없습니다.');

  const applications = await CircleApplicationModel.find({
    circle: circle._id,
  }).populateTs('applier');

  res.json({ applications });
};

export const setApplierStatus = async (req: Request, res: Response) => { const { user } = req;
  const circle = await CircleModel.findByChairs(user._id);
  if (!circle) throw new HttpException(403, '동아리장 권한이 없습니다.');

  const application = await CircleApplicationModel.findById(req.params.applicationId);
  if (!application) throw new HttpException(404, '해당 동아리 지원서를 찾을 수 없습니다.');

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
