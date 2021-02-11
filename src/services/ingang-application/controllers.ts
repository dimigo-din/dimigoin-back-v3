import { Request, Response } from 'express';
import { ObjectID } from 'mongodb';
import moment from 'moment-timezone';
import { HttpException } from '../../exceptions';
import { IngangApplicationDoc, IngangApplicationModel } from '../../models';
import { getConfig } from '../../resources/config';
import { ConfigKeys, Grade, NightTime } from '../../types';
import { createIngangApplierBook } from '../../resources/exporter';
import { writeFile } from '../../resources/file';
import {
  getTodayDateString,
  getWeekStartString,
  getWeekEndString,
  getKoreanTodayFullString,
  getMinutesValue,
} from '../../resources/date';

const getWeeklyUsedTicket = async (applier: ObjectID) => await IngangApplicationModel.countDocuments({
  applier,
  date: {
    $gte: getWeekStartString(),
    $lte: getWeekEndString(),
  },
});

const getApplicationsByClass = async (grade: number, klass: number) => (await IngangApplicationModel
  .find({ date: getTodayDateString() })
  .populateTs('applier'))
  .filter((application) => (
    application.applier.grade === grade
      && application.applier.class === klass
  ));

const getMaxApplicationPerIngang = async (grade: number) => (await getConfig(ConfigKeys.ingangMaxAppliers))[grade];

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

export const getTodayIngangApplications = async (req: Request, res: Response) => {
  const { userType, _id: applier } = req.user;

  const ingangApplications = await IngangApplicationModel
    .find({
      ...(userType === 'S' ? { applier } : {}),
      date: getTodayDateString(),
    })
    .populateTs('applier');
  res.json({ ingangApplications });
};

export const exportTodayIngangApplications = async (req: Request, res: Response) => {
  const grade = parseInt(req.params.grade) as Grade;
  const applications = (
    await IngangApplicationModel.find({
      date: getTodayDateString(),
    }).populateTs('applier')
  ).filter((a) => a.applier.grade === grade);

  type SplittedApps = [IngangApplicationDoc[], IngangApplicationDoc[]];
  const splittedApplications = applications.reduce(
    (acc: SplittedApps, curr: IngangApplicationDoc) => {
      const time = parseInt(curr.time.substr(-1), 10) - 1;
      acc[time].push(curr);
      return acc;
    },
    [[], []],
  );

  const buffer = await createIngangApplierBook(grade, splittedApplications);
  const today = getKoreanTodayFullString();
  const fileName = `${grade}학년 인터넷 강의실 좌석 신청 현황 (${today} 기준)`;
  const file = await writeFile(buffer, fileName, 'xlsx', req.user);

  res.json({ exportedFile: file });
};

export const createIngangApplication = async (req: Request, res: Response) => {
  const applyPeriod = await getConfig(ConfigKeys.ingangApplyPeriod);
  const applyStart = getMinutesValue(applyPeriod.start);
  const applyEnd = getMinutesValue(applyPeriod.end);
  const now = getMinutesValue({
    hour: moment().hour(),
    minute: moment().minute(),
  });
  if (now < applyStart || applyEnd < now) {
    throw new HttpException(403, '인강실 신청 시간이 아닙니다.');
  }

  const { _id: applier, grade } = req.user;
  const today = getTodayDateString();
  const time = req.params.time as NightTime;

  const checkDuplicate = IngangApplicationModel.checkDuplicatedApplication;

  if (await checkDuplicate(applier, today, time)) {
    throw new HttpException(409, '이미 해당 시간 인강실을 신청했습니다.');
  }

  const todayAll = await IngangApplicationModel.find({
    date: today,
    time,
  }).populateTs('applier');

  // 신청하려는 인강실 (학년과 신청 타임 기준)에 존재하는 모든 신청 불러옴
  const classAll = todayAll.filter((v) => v.applier.grade === grade);

  const maxApply = await getMaxApplicationPerIngang(grade);
  if (classAll.length >= maxApply) {
    throw new HttpException(403, '최대 인강실 인원을 초과했습니다.');
  }

  // 자신이 보유한 티켓 개수 이상으로 신청했는지 확인
  const weeklyUsedTicket = await getWeeklyUsedTicket(applier);
  const weeklyTicketCount = await getConfig(ConfigKeys.weeklyIngangTicketCount);
  if (weeklyTicketCount <= weeklyUsedTicket) {
    throw new HttpException(409, '이번 주 인강실 티켓을 모두 사용했습니다.');
  }

  const ingangApplication = await new IngangApplicationModel({
    ...req.body,
    time,
    applier,
    date: today,
  }).save();
  res.json({ ingangApplication });
};

export const removeIngangApplication = async (req: Request, res: Response) => {
  const { _id: applier } = req.user;
  const today = getTodayDateString();
  const time = req.params.time as NightTime;

  const ingangApplication = await IngangApplicationModel.findOne({
    applier,
    date: today,
    time,
  });
  if (!ingangApplication) throw new HttpException(404, '해당 시간 신청한 인강실이 없습니다.');
  await ingangApplication.remove();
  res.json({ ingangApplication });
};
