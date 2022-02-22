import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HttpException } from '../../exceptions';
import {
  CheckinLogModel,
  MealExceptionModel,
  MealOrderModel,
  StudentModel,
} from '../../models/dalgeurak';
import { MealExceptionValues, MealStatusType } from '../../types';
import {
  getNowTime,
  getNowTimeString,
  getExtraTime,
} from '../../resources/date';

export const checkTardy = async (req: Request, res: Response) => {
  const nowTime = getNowTime();
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  if (nowTime < 1150) throw new HttpException(401, '점심 시간 전 입니다.');
  if (nowTime > 1400 && nowTime < 1830) throw new HttpException(401, '저녁 시간 전 입니다.');
  if (nowTime > 2000) throw new HttpException(401, '저녁시간이 지났습니다.');

  const student = await StudentModel.findById(req.user._id);
  if (student.status !== 'empty') throw new HttpException(401, '이미 인증된 사용자입니다.');

  const { extraMinute } = await MealOrderModel.findOne({ field: 'intervalTime' });

  type nowType = 'lunch' | 'dinner';
  let now: nowType;

  if (nowTime >= 1150 && nowTime <= 1400) now = 'lunch';
  else if (nowTime >= 1830) now = 'dinner';

  const gradeIdx = req.user.grade - 1;
  const classIdx = mealSequences[now][gradeIdx].indexOf(req.user.class);
  const extraTime = getExtraTime(extraMinute, mealTimes[now][gradeIdx][classIdx]); // 본인 반의 밥시간
  let nextExtraTime; // 다음 반의 밥시간

  if (classIdx === 5) nextExtraTime = getExtraTime(extraMinute + 3, mealTimes[now][gradeIdx][classIdx]); // 순서가 마지막일 때 반 시간에서 3분 추가
  else nextExtraTime = getExtraTime(extraMinute, mealTimes[now][gradeIdx][classIdx + 1]); // 다음 반 밥시간

  let mealStatus: MealStatusType = 'empty';

  const exception = await MealExceptionModel.findOne({ serial: req.user.serial });
  if (nowTime < extraTime) {
    if (exception) mealStatus = 'onTime'; // 선밥
    else throw new HttpException(401, '아직 반 식사시간이 아닙니다. 선밥을 신청해주세요.');
  } else if (nowTime >= extraTime && nowTime <= nextExtraTime) mealStatus = 'onTime';
  else if (nowTime > nextExtraTime) mealStatus = 'tardy'; // 지각

  Object.assign(student, { status: mealStatus });
  await student.save();
  await new CheckinLogModel({
    date: getNowTimeString(),
    student: new ObjectId(student._id),
    status: mealStatus,
  }).save();

  res.json({ mealStatus });
};

export const editExtraTime = async (req: Request, res: Response) => {
  const { extraMinute } = req.body;
  await MealOrderModel.findOneAndUpdate({ field: 'intervalTime' }, { extraMinute });
  res.json({ extraMinute });
};

export const getMealExceptions = async (req: Request, res: Response) => {
  const { type } = req.params;
  if (!MealExceptionValues.includes(type)) throw new HttpException(401, 'type parameter 종류는 first 또는 last 이어야 합니다.');

  const users = await MealExceptionModel.find({ exceptionType: type });

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
