import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { IngangApplicationModel } from '../../models';
import { getOnlyDate, getWeekStart, getWeekEnd } from '../../resources/date';
import { getConfig } from '../../resources/config';
import { ConfigKeys, NightTime } from '../../types';
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
  const { _id: applier, grade, class: klass } = req.user;

  const weeklyTicketCount = await getConfig(ConfigKeys.weeklyIngangTicketCount);
  const ingangMaxApplier = await getMaxApplicationPerIngang(grade);

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
  const { userType, _id: applier } = req.user;

  const ingangApplications = await IngangApplicationModel
    .find(userType === 'S' ? { applier } : {})
    .populateTs('applier');
  res.json({ ingangApplications });
};

export const createIngangApplication = async (req: Request, res: Response) => {
  const { _id: applier, grade } = req.user;
  const maxApply = await getMaxApplicationPerIngang(grade);
  const date = getOnlyDate(new Date());
  const time = req.params.time as NightTime;

  const checkDuplicate = IngangApplicationModel.checkDuplicatedApplication;

  if (await checkDuplicate(applier, date, time)) {
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
    time,
    applier,
  });
  await ingangApplication.save();
  res.json({ ingangApplication });
};

export const removeIngangApplication = async (req: Request, res: Response) => {
  const { _id: applier } = req.user;
  const date = getOnlyDate(new Date());
  const time = req.params.time as NightTime;

  const ingangApplication = await IngangApplicationModel.findOne({
    applier,
    date,
    time,
  });
  if (!ingangApplication) throw new HttpException(404, '해당 시간 신청한 인강실이 없습니다.');
  await ingangApplication.remove();
  res.json({ ingangApplication });
};
