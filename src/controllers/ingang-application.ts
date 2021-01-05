import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { IngangApplicationModel } from '../models';
import { getOnlyDate, getWeekStart, getWeekEnd } from '../resources/date';
import { getUserIdentity } from '../resources/user';
import { getConfig } from '../resources/config';
import { ConfigKeys } from '../types';

export const getIngangStatus = async (req: Request, res: Response) => {
  const weeklyTicketCount = await getConfig(ConfigKeys.weeklyIngangTicketCount);
  const { _id: applier, grade, class: klass } = await getUserIdentity(req);
  const weeklyUsedTicket = await IngangApplicationModel.countDocuments({
    applier,
    date: {
      $gte: getWeekStart(new Date()),
      $lte: getWeekEnd(new Date()),
    },
  });
  const ingangMaxApplier = (await getConfig(ConfigKeys.ingangMaxAppliers))[grade];
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
    ingangMaxApplier,
    applicationsInClass,
  });
};

export const getAllIngangApplications = async (req: Request, res: Response) => {
  const { userType, _id: applier } = await getUserIdentity(req);

  const ingangApplications = await IngangApplicationModel
    .find(userType === 'S' ? { applier } : {})
    .populateTs('applier');
  res.json({ ingangApplications });
};

export const createIngangApplication = async (req: Request, res: Response) => {
  const { _id: applier, grade } = await getUserIdentity(req);
  const date = getOnlyDate(new Date());
  const { time } = req.body;

  if (await IngangApplicationModel.checkDuplicatedApplication(
    applier,
    date,
    time,
  )) throw new HttpException(409, '이미 해당 시간 인강실을 신청했습니다.');

  const todayAll = await IngangApplicationModel.find({
    date,
    time,
  }).populateTs('applier');

  const maxApply = (await getConfig(ConfigKeys.ingangMaxAppliers))[grade - 1];

  // 신청하려는 인강실 (학년과 신청 타임 기준)에 존재하는 모든 신청 불러옴
  const classAll = todayAll.filter((v) => v.applier.grade === grade);
  if (classAll.length >= maxApply) {
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
