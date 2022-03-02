import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HttpException } from '../../exceptions';
import config from '../../config';
import {
  CheckinLogModel,
  MealExceptionModel,
  MealOrderModel,
} from '../../models/dalgeurak';
import { UserModel } from '../../models';
import {
  ClassType,
  MealExceptionValues,
  MealTardyStatusType,
  MealTimeType,
} from '../../types';
import { getNowTime, getNowTimeString } from '../../resources/date';
import { checkTardy, getUserMealTime } from '../../resources/dalgeurak';

const mealStatusFilter = (mealStatus: MealTardyStatusType): void => {
  switch (mealStatus) {
    case 'beforeLunch':
      throw new HttpException(401, '점심 시간 전 입니다.');
    case 'beforeDinner':
      throw new HttpException(401, '저녁 시간 전 입니다.');
    case 'afterDinner':
      throw new HttpException(401, '저녁시간이 지났습니다.');
    case 'certified':
      throw new HttpException(401, '이미 인증된 사용자입니다.');
    case 'early':
      throw new HttpException(401, '아직 반 식사시간이 아닙니다.');
    case 'waiting':
      throw new HttpException(401, '선/후밥 신청 대기 중 입니다.');
    case 'rejected':
      throw new HttpException(401, '선/후밥 신청이 거부되었습니다.');
    default:
      break;
  }
};

export const checkEntrance = async (req: Request, res: Response) => {
  const student = await UserModel.findOne({
    _id: req.user._id,
    userType: 'S',
  }).select('mealStatus');

  const mealStatus = await checkTardy(student);
  mealStatusFilter(mealStatus);

  Object.assign(student, { status: mealStatus });
  await student.save();
  await new CheckinLogModel({
    date: getNowTimeString(),
    student: new ObjectId(student._id),
    status: mealStatus,
  }).save();

  res.json({ mealStatus });
};

export const entranceProcess = async (req: Request, res: Response) => {
  const { serial, name } = req.body;

  const student = await UserModel.findOne({ serial, name }).select('mealStatus');
  if (!student) throw new HttpException(404, '학생을 찾을 수 없습니다.');

  const mealStatus = await checkTardy(student);
  mealStatusFilter(mealStatus);

  Object.assign(student, { status: mealStatus });
  await student.save();
  await new CheckinLogModel({
    date: getNowTimeString(),
    student: new ObjectId(student._id),
    status: mealStatus,
  }).save();

  res.json({ mealStatus });
};

export const getNowSequence = async (req: Request, res: Response) => {
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  const nowTime = await getNowTime();

  if (nowTime < 1150) throw new HttpException(401, '점심 시간 전 입니다.');
  if (nowTime > 1400 && nowTime < 1830) throw new HttpException(401, '저녁 시간 전 입니다.');
  if (nowTime > 2000) throw new HttpException(401, '저녁시간이 지났습니다.');

  type nowType = 'lunch' | 'dinner';
  let now: nowType;
  if (nowTime >= 1150 && nowTime <= 1400) now = 'lunch';
  else if (nowTime >= 1830) now = 'dinner';

  let gradeIdx: number;
  let classIdx: number;
  /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
  for (let i = 0; i < mealTimes[now].length; i++) {
    if (nowTime >= mealTimes[now][i][5]) {
      gradeIdx = i;
      classIdx = 5;
      break;
    }
    for (let j = 0; j < mealTimes[now][i].length - 1; j++) {
      if (nowTime >= mealTimes[now][i][j] && nowTime < mealTimes[now][i][j + 1]) {
        gradeIdx = i;
        classIdx = j;
        break;
      }
    }
  }

  res.json({
    nowSequence: mealSequences[now][gradeIdx][classIdx],
  });
};

export const getUserInfo = async (req: Request, res: Response) => {
  const student = await UserModel.findById(req.user._id).select('mealStatus');
  const exception = await MealExceptionModel.findOne({ serial: req.user.serial });
  const mealStatus = await checkTardy(student);
  const extraTime = await getUserMealTime(student);

  res.json({
    mealStatus,
    exception: exception ? exception.exceptionType : 'normal',
    mealTime: extraTime,
  });
};

export const editExtraTime = async (req: Request, res: Response) => {
  const { extraMinute } = req.body;
  await MealOrderModel.findOneAndUpdate({ field: 'intervalTime' }, { extraMinute });
  res.json({ extraMinute });
};

export const getMealExceptions = async (req: Request, res: Response) => {
  const users = await MealExceptionModel.find({ });

  res.json({ users });
};
export const createMealExceptions = async (req: Request, res: Response) => {
  const { type } = req.params;
  const { reason } = req.body;
  const { serial } = req.user;
  if (!MealExceptionValues.includes(type)) throw new HttpException(401, 'type parameter 종류는 first 또는 last 이어야 합니다.');

  const exceptionStatus = await MealExceptionModel.findOne({ serial });
  if (exceptionStatus) throw new HttpException(401, '이미 등록되어 있습니다.');

  const exception = await new MealExceptionModel({
    exceptionType: type,
    serial,
    reason,
  }).save();

  res.json({ exception });
};
export const cancelMealException = async (req: Request, res: Response) => {
  const { serial } = req.user;
  const exception = await MealExceptionModel.findOne({ serial });
  if (!exception) throw new HttpException(404, '선/후밥 신청 데이터를 찾을 수 없습니다.');

  await exception.deleteOne();
  res.json({ exception });
};
export const permissionMealException = async (req: Request, res: Response) => {
  const { serial, permission } = req.body;

  const exception = await MealExceptionModel.findOne({ serial });
  if (!exception) throw new HttpException(404, '신청 데이터를 찾을 수 없습니다.');

  if (permission) Object.assign(exception, { applicationStatus: 'permitted' });
  else Object.assign(exception, { applicationStatus: 'rejected' });

  await exception.save();
  res.json({ exception });
};

export const getMealSequences = async (req: Request, res: Response) => {
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  res.json({ mealSequences });
};
export const getMealTimes = async (req: Request, res: Response) => {
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  res.json({ mealTimes });
};

export const editMealSequences = async (req: Request, res: Response) => {
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  Object.assign(mealSequences, req.body);
  await mealSequences.save();

  res.json({ mealSequences });
};
export const editMealTimes = async (req: Request, res: Response) => {
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  Object.assign(mealTimes, req.body);
  await mealTimes.save();

  res.json({ mealTimes });
};

export const editGradeMealSequences = async (req: Request, res: Response) => {
  interface GradeMealSequences {
    time: MealTimeType;
    sequences: ClassType;
  }

  const gradeIdx = parseInt(req.params.grade) - 1;
  const { time, sequences }: GradeMealSequences = req.body;

  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  mealSequences[time].splice(gradeIdx, 1, sequences);
  Object.assign(mealSequences, {
    ...mealSequences,
  });
  await mealSequences.save();

  res.json({ sequences });
};
export const editGradeMealTimes = async (req: Request, res: Response) => {
  interface GradeMealTimes {
    time: MealTimeType;
    classTimes: ClassType;
  }

  const gradeIdx = parseInt(req.params.grade) - 1;
  const { time, classTimes }: GradeMealTimes = req.body;

  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  mealTimes[time].splice(gradeIdx, 1, classTimes);
  Object.assign(mealTimes, {
    ...mealTimes,
  });
  await mealTimes.save();

  res.json({ classTimes });
};

export const reloadUsersMealStatus = async (req: Request, res: Response) => {
  await UserModel.updateMany({ userType: 'S' }, { mealStatus: 'empty' });
  res.json({ success: true });
};

export const getKey = async (req: Request, res: Response) => {
  const { dalgeurakKey } = config;
  res.json({ key: dalgeurakKey });
};
