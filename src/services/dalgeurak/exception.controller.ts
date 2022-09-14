import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { popUser } from '../../resources/dalgeurak';
import {
  getDayCode,
  getNextWeekDay,
} from '../../resources/date';
import io from '../../resources/socket';
import { HttpException } from '../../exceptions';
import { MealExceptionModel } from '../../models/dalgeurak';
import {
  MealConfigKeys, MealExceptionTimeValues, MealExceptionValues,
} from '../../types';
import { DGRsendPushMessage } from '../../resources/dalgeurakPush';
import { UserModel } from '../../models';
import { getMealConfig } from '../../resources/config';

export const getMealExceptions = async (req: Request, res: Response) => {
  const users = await MealExceptionModel.find({ }).populate(popUser('applier'));

  res.json({ users });
};
export const createMealExceptions = async (req: Request, res: Response) => {
  const { type } = req.params;
  const {
    sid, reason, date, time,
  } = req.body;
  const { _id: applier } = req.user;

  if (sid.length < 5) throw new HttpException(401, '최소 신청자 수는 다섯 명부터입니다.');
  if (!MealExceptionValues.includes(type)) throw new HttpException(401, 'type parameter 종류는 first 또는 last 이어야 합니다.');
  if (!MealExceptionTimeValues.includes(time)) throw new HttpException(401, 'time 형태가 올바르지 않습니다.');

  const today = getDayCode();
  if (today === 'fri' || today === 'sat' || today === 'sun') throw new HttpException(401, '신청할 수 없는 요일입니다.');

  const exceptionStatus = await MealExceptionModel.find({
    _id: {
      $in: sid.map((s: string) => new ObjectId(s)),
    },
    applicationStatus: {
      $ne: 'reject',
    },
  });
  if (exceptionStatus.length > 0) throw new HttpException(401, '이미 신청되어 있는 학생이 있습니다.');

  const weekday = ['sun', 'mon', 'tue', 'wed', 'thr', 'fri', 'sat'];
  if (!weekday.includes(date)) throw new HttpException(401, '요일 형태가 올바르지 않습니다.');
  const appliDate = getNextWeekDay(weekday.indexOf(date) + 7);

  const firstMealMaxNum = await getMealConfig(MealConfigKeys.firstMealMaxApplicationPerMeal);
  const lastMealMaxNum = await getMealConfig(MealConfigKeys.lastMealMaxApplicationPerMeal);

  const exceptionMealCount = await MealExceptionModel.count({
    exceptionType: type,
    date: appliDate,
    time,
  });
  if (exceptionMealCount + sid.length >= (type === 'first' ? firstMealMaxNum : lastMealMaxNum)) {
    throw new HttpException(401, `${
      (exceptionMealCount + sid.length) - (type === 'first' ? firstMealMaxNum : lastMealMaxNum)
    }명 초과하였습니다.`);
  }

  sid.forEach(async (student: string) => {
    await new MealExceptionModel({
      exceptionType: type,
      applier: student,
      reason,
      time,
      date: appliDate,
      applicationStatus: type === 'last' ? 'approve' : 'waiting',
    });
  });

  const representative = await UserModel.findById(applier);

  if (type === 'first') {
    await DGRsendPushMessage(
      { role: `${representative.grade}학년 ${representative.class}반 담임` },
      '선밥 신청 알림',
      `${representative.name} 학생 외 총 ${sid.length}명이 선밥 신청하였습니다.\n담임 선생님의 승인 대기 중입니다.`,
    );
  }

  res.json({ date: appliDate });
};

// 선후밥
// export const cancelMealException = async (req: Request, res: Response) => {
//   const { _id } = req.user;
//   const exception = await MealExceptionModel.findOne({ applier: _id });
//   if (!exception) throw new HttpException(404, '선/후밥 신청 데이터를 찾을 수 없습니다.');

//   await exception.deleteOne();
//   res.json({ exception });
// };
export const permissionMealException = async (req: Request, res: Response) => {
  const { sid, permission } = req.body;

  const exception = await MealExceptionModel.findOne({ applier: sid });
  if (!exception) throw new HttpException(404, '신청 데이터를 찾을 수 없습니다.');

  Object.assign(exception, { applicationStatus: permission });

  await DGRsendPushMessage(
    { _id: sid },
    `${exception.exceptionType === 'first' ? '선밥' : '후밥'} 신청 알림`,
    `${exception.exceptionType === 'first' ? '선밥' : '후밥'} 신청이 ${
      permission === 'approve' ? '승인'
        : permission === 'reject' && '반려'
    } 되었습니다.`,
  );

  await exception.save();
  res.json({ exception });
};
export const giveMealException = async (req: Request, res: Response) => {
  const { type, sid, reason } = req.body;

  const teacher = await UserModel.findById(req.user._id);

  const exceptionStatus = await MealExceptionModel.findOne({ applier: sid });
  if (exceptionStatus) {
    Object.assign(exceptionStatus, { applicationStatus: 'approve' });

    await exceptionStatus.save();

    await DGRsendPushMessage(
      { _id: sid },
      `${type === 'first' ? '선밥' : '후밥'} 안내`,
      `${teacher.name} 선생님에 의해 ${type === 'first' ? '선밥' : '후밥'} 처리가 되었습니다.`,
    );
    res.json({ exception: exceptionStatus });
  } else {
    const exception = await new MealExceptionModel({
      exceptionType: type,
      applier: sid,
      reason,
    }).save();

    await DGRsendPushMessage(
      { _id: sid },
      `${type === 'first' ? '선밥' : '후밥'} 안내`,
      `${teacher.name} 선생님에 의해 ${type === 'first' ? '선밥' : '후밥'} 처리가 되었습니다.`,
    );

    res.json({ exception });
  }
  io.of('/dalgeurak').to('mealStatus').emit('mealStatus', {
    _id: sid,
    mealStatus: 'certified',
  });
};
