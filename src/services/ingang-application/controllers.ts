import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import {
  IngangApplicationDoc, IngangApplicationModel,
  AttendanceLogModel, PlaceModel,
} from '../../models';
import { getConfig } from '../../resources/config';
import { ConfigKeys, Grade, NightTime } from '../../types';
import { createIngangApplierBook } from '../../resources/exporter';
import { writeFile } from '../../resources/file';
import {
  getTodayDateString,
  getWeekStartString,
  getWeekEndString,
  getKoreanTodayFullString,
} from '../../resources/date';
import { getStudentInfo } from '../../resources/dimi-api';

const getWeeklyUsedTicket = async (applier: number) => await IngangApplicationModel.countDocuments({
  applier,
  date: {
    $gte: getWeekStartString(),
    $lte: getWeekEndString(),
  },
});

const getApplicationsByClass = async (grade: number, klass: number) => (
  await IngangApplicationModel.find({ date: getTodayDateString() }))
  .filter(async (application) => {
    const applier = await getStudentInfo(application.applier);
    return (
      applier.grade === grade
        && applier.class === klass
    );
  });

const getMaxApplicationPerClass = async (grade: number) => (await getConfig(ConfigKeys.ingangMaxApplicationPerClass))[grade];
const getSelfStudyTimes = async (grade: number) => (await getConfig(ConfigKeys.selfStudyTimes))[grade];

export const getIngangApplicationStatus = async (req: Request, res: Response) => {
  const { user_id: applier, grade, class: klass } = req.user;

  const weeklyTicketCount = await getConfig(ConfigKeys.weeklyIngangTicketCount);
  const ingangMaxApplier = await getMaxApplicationPerClass(grade);

  const selfStudyTimes = await getSelfStudyTimes(grade);
  const ingangApplyPeriod = await getConfig(ConfigKeys.ingangApplyPeriod);

  const weeklyUsedTicket = await getWeeklyUsedTicket(applier);
  const applicationsInClass = await getApplicationsByClass(grade, klass);
  const weeklyRemainTicket = weeklyTicketCount - weeklyUsedTicket;

  res.json({
    weeklyTicketCount,
    weeklyUsedTicket,
    weeklyRemainTicket,
    ingangMaxApplier,
    applicationsInClass,
    selfStudyTimes,
    ingangApplyPeriod,
  });
};

export const getTodayIngangApplications = async (req: Request, res: Response) => {
  const { user_id: applier } = req.user;

  const ingangApplications = await IngangApplicationModel
    .find({
      applier,
      date: getTodayDateString(),
    });
  ingangApplications.forEach(async (e, idx) => {
    (ingangApplications[idx].applier as any) = await getStudentInfo(e.applier);
  });
  res.json({ ingangApplications });
};

export const getTodayEntireIngangApplications = async (req: Request, res: Response) => {
  const ingangApplications = await IngangApplicationModel
    .find({
      date: getTodayDateString(),
    });

  ingangApplications.forEach(async (e, idx) => {
    (ingangApplications[idx].applier as any) = await getStudentInfo(e.applier);
  });

  res.json({ ingangApplications });
};

export const exportTodayIngangApplications = async (req: Request, res: Response) => {
  const grade = parseInt(req.params.grade) as Grade;
  const applications = (
    await IngangApplicationModel.find({
      date: getTodayDateString(),
    })
  ).filter(async (a) => {
    const applier = await getStudentInfo(a.applier);
    return applier.grade === grade;
  });

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

const checkDuplicate = async (applier: number, date: string, time: NightTime) => !!(await IngangApplicationModel.findOne({
  applier,
  time,
  date,
}));

export const createIngangApplication = async (req: Request, res: Response) => {
  const { user_id: applier, grade, class: klass } = req.user;
  const today = getTodayDateString();
  const time = req.params.time as NightTime;

  if (await checkDuplicate(applier, today, time)) {
    throw new HttpException(409, '이미 해당 시간 인강실을 신청했습니다.');
  }

  // 오늘 생성된 모든 인강실 신청을 불러옴
  const todayAll = await IngangApplicationModel.find({
    date: today,
    time,
  });

  // 신청하려는 타임 인강실 신청 중 같은 반 학생들의 신청을 불러옴
  const classAll = todayAll.filter(async (v) => {
    const student = await getStudentInfo(v.applier);
    return student.grade === grade && student.class === klass;
  });

  const maxApply = await getMaxApplicationPerClass(grade);
  if (classAll.length >= maxApply) {
    throw new HttpException(403, '학급별 최대 인강실 인원을 초과했습니다.');
  }

  // 자신이 보유한 티켓 개수 이상으로 신청했는지 확인
  const weeklyUsedTicket = await getWeeklyUsedTicket(applier);
  const weeklyTicketCount = await getConfig(ConfigKeys.weeklyIngangTicketCount);
  if (weeklyTicketCount <= weeklyUsedTicket) {
    throw new HttpException(403, '이번 주 인강실 티켓을 모두 사용했습니다.');
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
  const { user_id: applier } = req.user;
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

const gp = async (name: string) => (await PlaceModel.findOne({ name })).toJSON();

export const forceApplierToAttendnaceIngangsil = async (req: Request, res: Response) => {
  const ingangApplication = await IngangApplicationModel.findById(
    req.params.applicationId,
  );
  if (!ingangApplication) throw new HttpException(404, '해당 인강실 신청을 찾을 수 없습니다.');

  const today = getTodayDateString();
  if (ingangApplication.date !== today) {
    throw new HttpException(403, '오늘자 인강실을 신청한 사람만 인강실에 출석시킬 수 있습니다.');
  }

  const applier = await getStudentInfo(ingangApplication.applier);

  const attendanceLog = new AttendanceLogModel({
    date: getTodayDateString(),
    student: applier.user_id,
    remark: '인강실 도우미가 등록함',
    place: [
      await gp('영어 전용 교실'),
      await gp('비즈쿨실'),
      await gp('열람실'),
    ][applier.grade - 1],
    updatedBy: req.user.user_id,
  });

  await attendanceLog.save();
  res.json({ attendanceLog });
};
