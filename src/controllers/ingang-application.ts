import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { IngangApplicationModel } from '../models';
import { getOnlyDate, getWeekStart, getWeekEnd } from '../resources/date';
import { getUserIdentity } from '../resources/user';
import { getConfig } from '../resources/config';
import { ConfigKeys } from '../types';
import { ObjectID } from 'mongodb';

const getWeeklyUsedTicket = async (applier: ObjectID) => {
  return await IngangApplicationModel.countDocuments({
    applier,
    date: {
      $gte: getWeekStart(new Date()),
      $lte: getWeekEnd(new Date()),
    },
  });
}

const getApplicationsByClass = async (grade: number, klass: number) => {
  return (await IngangApplicationModel
    .find({ date: getOnlyDate(new Date()) })
    .populateTs('applier'))
    .filter((application) => (
      application.applier.grade === grade
      && application.applier.class === klass
    ));
}

const getMaxApplicationPerIngang = async (grade: number) => {
  return (await getConfig(ConfigKeys.ingangMaxAppliers))[grade];
}

export const getIngangStatus = async (req: Request, res: Response) => {
  const { _id: applier, grade, class: klass } = await getUserIdentity(req);

  const weeklyTicketCount = await getConfig(ConfigKeys.weeklyIngangTicketCount);
  const ingangMaxApplier = getMaxApplicationPerIngang(grade);

  const weeklyUsedTicket = await getWeeklyUsedTicket(applier);
  const applicationsInClass = await getApplicationsByClass(grade, klass);
  const weeklyRemainTicket = weeklyTicketCount - weeklyUsedTicket;

  res.json({
    weeklyTicketCount,
    weeklyUsedTicket,
    weeklyRemainTicket,
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
  const maxApply = await getMaxApplicationPerIngang(grade);
  const date = getOnlyDate(new Date());
  const { time } = req.body;

  // 해당 인강실을 기존에 신청했는지 확인
  if (await IngangApplicationModel.checkDuplicatedApplication(applier, date, time)) {
    throw new HttpException(409, '이미 해당 시간 인강실을 신청했습니다.');
  }

  const todayAll = await IngangApplicationModel.find({
    date,
    time,
  }).populateTs('applier');

  // 신청하려는 인강실 (학년과 신청 타임 기준)에 존재하는 모든 신청 불러옴
  const classAll = todayAll.filter((v) => v.applier.grade === grade);
  if (classAll.length >= maxApply) {
    throw new HttpException(403, '최대 인강실 인원을 초과했습니다.');
  }

  // 티켓 개수 이상으로 신청했는지 확인
  const weeklyUsedTicket = await getWeeklyUsedTicket(applier);
  const weeklyTicketCount = await getConfig(ConfigKeys.weeklyIngangTicketCount);
  if (weeklyTicketCount <= weeklyUsedTicket) {
    throw new HttpException(409, '이번 주 인강실 티켓을 모두 사용했습니다.');
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
