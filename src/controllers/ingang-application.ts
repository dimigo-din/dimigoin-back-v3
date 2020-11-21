import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { IngangApplicationModel } from '../models';
import { getOnlyDate, getWeekStart, getWeekEnd } from '../resources/date';
import { getUserIdentity } from '../resources/user';
import { getConfig } from '../resources/config';

export const getIngangStatus = async (req: Request, res: Response) => {
  const weeklyTicketCount = await getConfig('weeklyIngangTicketCount');
  const { _id: applier, grade, class: klass } = await getUserIdentity(req);
  const weeklyUsedTicket = await IngangApplicationModel.countDocuments({
    applier,
    date: {
      $gte: getWeekStart(new Date()),
      $lte: getWeekEnd(new Date()),
    },
  });
  const applicationsInClass = (await IngangApplicationModel
    .find({ date: getOnlyDate(new Date()) })
    .populateTs('applier'))
    .filter((application) => (
      application.applier.grade === grade
      && application.applier.class === klass
    ));

  res.json({
    weeklyTicketCount,
    weeklyUsedTicket,
    applicationsInClass,
  });
};

export const getAllIngangApplications = async (req: Request, res: Response) => {
  const { userType, _id: applier } = await getUserIdentity(req);

  if (userType === 'T') {
    const ingangApplications = await IngangApplicationModel.find({});
    res.json({ ingangApplications });
  } else if (userType === 'S') {
    const ingangApplications = await IngangApplicationModel
      .find({ applier });
    res.json({ ingangApplications });
  } else {
    throw new HttpException(403, '권한이 없습니다.');
  }
};

export const createIngangApplication = async (req: Request, res: Response) => {
  const { _id: applier, class: _class } = await getUserIdentity(req);
  const date = getOnlyDate(new Date());
  const { time } = req.body;
  const existing = await IngangApplicationModel.findOne({
    applier,
    date,
    time,
  });
  if (existing) throw new HttpException(409, '이미 해당 시간 인강실을 신청했습니다.');

  const todayAll = await IngangApplicationModel.find({
    date,
    time,
  }).populateTs('applier');

  if (todayAll.filter((v) => v.applier.class === _class).length >= 9) {
    throw new HttpException(403, '최대 인강실 인원을 초과했습니다.');
  }

  const ingangApplication = new IngangApplicationModel();
  Object.assign(ingangApplication, {
    ...req.body,
    applier,
  });
  await ingangApplication.save();
  res.json({ ingangApplication });
};

export const removeIngangApplication = async (req: Request, res: Response) => {
  const { _id: applier } = await getUserIdentity(req);
  const date = getOnlyDate(new Date());
  const ingangApplication = await IngangApplicationModel.findOne({
    applier,
    date,
    time: req.body.time,
  });
  if (!ingangApplication) throw new HttpException(404, '해당 시간 신청한 인강실이 없습니다.');
  await ingangApplication.remove();
  res.json({ ingangApplication });
};
