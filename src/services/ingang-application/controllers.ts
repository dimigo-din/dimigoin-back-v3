import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import * as Ingang from '../../models/ingang-application';
import { getOnlyDate } from '../../resources/date';
import { getConfig } from '../../resources/config';
import { ConfigKeys, NightTime } from '../../types';

const getMaxApplicationPerIngang = async (grade: number) => {
  return (await getConfig(ConfigKeys.ingangMaxAppliers))[grade];
};

export const getIngangStatus = async (req: Request, res: Response) => {
  const { _id: applier, grade, class: klass } = req.user;

  const weeklyTicketCount = await getConfig(ConfigKeys.weeklyIngangTicketCount);
  const ingangMaxApplier = await getMaxApplicationPerIngang(grade);

  const weeklyUsedTicket = await Ingang.getWeeklyUsedTicket(applier);
  const applicationsInClass = await Ingang.getApplicationsByClass(grade, klass);
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

  const ingangApplications = await Ingang.model
    .find(userType === 'S' ? { applier } : {})
    .populateTs('applier');
  res.json({ ingangApplications });
};

export const createIngangApplication = async (req: Request, res: Response) => {
  const { _id: applier, grade } = req.user;
  const maxApply = await getMaxApplicationPerIngang(grade);
  const date = getOnlyDate(new Date());
  const time = req.params.time as NightTime;

  if (await Ingang.checkDuplicatedApplication(applier, date, time)) {
    throw new HttpException(409, '이미 해당 시간 인강실을 신청했습니다.');
  }

  const todayAll = await Ingang.model.find({
    date,
    time,
  }).populateTs('applier');

  // 신청하려는 인강실 (학년과 신청 타임 기준)에 존재하는 모든 신청 불러옴
  const classAll = todayAll.filter((v) => v.applier.grade === grade);
  if (classAll.length >= maxApply) {
    throw new HttpException(403, '최대 인강실 인원을 초과했습니다.');
  }

  // 티켓 개수 이상으로 신청했는지 확인
  const weeklyUsedTicket = await Ingang.getWeeklyUsedTicket(applier);
  const weeklyTicketCount = await getConfig(ConfigKeys.weeklyIngangTicketCount);
  if (weeklyTicketCount <= weeklyUsedTicket) {
    throw new HttpException(409, '이번 주 인강실 티켓을 모두 사용했습니다.');
  }

  const ingangApplication = await new Ingang.model({
    ...req.body,
    time,
    applier,
  }).save();
  await ingangApplication.save();
  res.json({ ingangApplication });
};

export const removeIngangApplication = async (req: Request, res: Response) => {
  const { _id: applier } = req.user;
  const date = getOnlyDate(new Date());
  const time = req.params.time as NightTime;

  const ingangApplication = await Ingang.model.findOne({
    applier,
    date,
    time,
  });
  if (!ingangApplication) throw new HttpException(404, '해당 시간 신청한 인강실이 없습니다.');
  await ingangApplication.remove();
  res.json({ ingangApplication });
};
