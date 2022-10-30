import { Request, Response } from 'express';
import { getNowMealTime } from '../../resources/dalgeurak';
import {
  // format,
  getDayCode,
  getNextWeekDay,
  getNowTime,
  getTodayDateString,
  // getWeekCalcul,
} from '../../resources/date';
import io from '../../resources/socket';
import { HttpException } from '../../exceptions';
import { MealExceptionModel } from '../../models/dalgeurak';
import {
  MealConfigKeys, MealExceptionTimeType, MealExceptionTimeValues, MealExceptionValues,
} from '../../types';
import { DGRsendPushMessage } from '../../resources/dalgeurakPush';
import { getMealConfig } from '../../resources/config';
import { getStudentInfo } from '../../resources/dimi-api';

const weekday = ['sun', 'mon', 'tue', 'wed', 'thr', 'fri', 'sat'];

export const getMealExceptions = async (req: Request, res: Response) => {
  const users = await MealExceptionModel.find({ });

  res.json({ users });
};
export const createMealExceptions = async (req: Request, res: Response) => {
  const { type } = req.params;
  const {
    appliers = [],
    group,
    reason,
    date,
    time,
  } = req.body;
  const { user_id: applier } = req.user;

  const nowTime = getNowTime();
  if (nowTime < 800) throw new HttpException(401, '신청시간이 아닙니다.');

  // const applicationCount = await getMealConfig(MealConfigKeys.mealExceptionApplicationCount);

  // const applications = await MealExceptionModel.count({
  //   date: {
  //     $gte: getWeekCalcul(7).format(format),
  //     $lte: getWeekCalcul(11).format(format),
  //   },
  //   $or: [
  //     { applier },
  //     {
  //       appliers: {
  //         $elemMatch: {
  //           student: {
  //             $in: appliers,
  //           },
  //         },
  //       },
  //     },
  //   ],
  // });
  // if (applications >= applicationCount) {
  //   throw new HttpException(
  //     401,
  //     `${applicationCount}회 이상 신청${group ? '한 학생이 있어 선/후밥을 신청할 수 없습니다.' : '할 수 없습니다.'}`,
  //   );
  // }

  if (appliers.length < 5 && group) throw new HttpException(401, '최소 신청자 수는 다섯 명부터입니다.');
  if (!MealExceptionValues.includes(type)) throw new HttpException(401, 'type parameter 종류는 first 또는 last 이어야 합니다.');
  if (!MealExceptionTimeValues.includes(time)) throw new HttpException(401, 'time 형태가 올바르지 않습니다.');

  const today = getDayCode();
  if (today === 'fri' || today === 'sat' || today === 'sun') throw new HttpException(401, '신청할 수 없는 요일입니다.');

  if (!weekday.includes(date)) throw new HttpException(401, '요일 형태가 올바르지 않습니다.');
  const appliDate = getNextWeekDay(weekday.indexOf(date) + 7);

  const exceptionStatus = await MealExceptionModel.findOne({
    $or: [
      { applier },
      {
        appliers: {
          $elemMatch: {
            student: {
              $in: appliers,
            },
          },
        },
      },
    ],
    applicationStatus: {
      $ne: 'reject',
    },
    time,
    date: appliDate,
  });
  if (exceptionStatus) {
    throw new HttpException(
      401,
      group ? '이미 신청되어 있는 학생이 있습니다.' : '이미 신청하였습니다.',
    );
  }

  const firstMealMaxNum = await getMealConfig(MealConfigKeys.firstMealMaxApplicationPerMeal);
  const lastMealMaxNum = await getMealConfig(MealConfigKeys.lastMealMaxApplicationPerMeal);

  const exceptionMealCount = await MealExceptionModel.count({
    exceptionType: type,
    date: appliDate,
    time,
  });
  if (group && exceptionMealCount + appliers.length >= (type === 'first' ? firstMealMaxNum : lastMealMaxNum)) {
    throw new HttpException(401, `${
      (exceptionMealCount + appliers.length) - (type === 'first' ? firstMealMaxNum : lastMealMaxNum)
    }명 초과하였습니다.`);
  } else if (!group && exceptionMealCount >= (type === 'first' ? firstMealMaxNum : lastMealMaxNum)) {
    throw new HttpException(401, '신청인원수를 초과하였습니다.');
  }

  await new MealExceptionModel({
    exceptionType: type,
    applier,
    appliers: appliers.map((e: string) => ({ student: e, entered: false })),
    reason,
    time,
    group,
    date: appliDate,
    // applicationStatus: type === 'last' ? 'approve' : 'waiting',
    applicationStatus: 'approve',
  }).save();

  // const representative = await UserModel.findById(applier);

  // if (type === 'first') {
  //   await DGRsendPushMessage(
  //     { permissions: 'dalgeurak', userType: 'S' },
  //     '선밥 신청 알림',
  //     `${group
  //       ? `${representative.name} 학생 포함 총 ${appliers.length}명이 선밥 신청하였습니다.`
  //       : `${representative.name} 학생이 선밥 신청하였습니다.`
  //     }\n디넌의 승인 대기 중입니다.`,
  //   );
  // }

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
  const {
    id: _id,
    permission,
    reason = '',
  } = req.body;

  const exception = await MealExceptionModel.findOne({ _id });
  if (!exception) throw new HttpException(404, '신청 데이터를 찾을 수 없습니다.');

  Object.assign(exception, {
    applicationStatus: permission,
    ...() => (permission === 'reject' ? { rejectReason: reason } : {}),
  });
  await exception.save();

  await DGRsendPushMessage(
    { user_id: exception.applier },
    `${exception.exceptionType === 'first' ? '선밥' : '후밥'} 신청 알림`,
    `${exception.exceptionType === 'first' ? '선밥' : '후밥'} 신청이 ${
      permission === 'approve' ? '승인'
        : permission === 'reject' && '반려'
    } 되었습니다.`,
  );

  res.json({ exception });
};
export const giveMealException = async (req: Request, res: Response) => {
  const { type, sid, reason } = req.body;

  const teacher = await getStudentInfo(req.user.user_id);

  const exceptionStatus = await MealExceptionModel.findOne({ applier: sid });
  if (exceptionStatus) {
    Object.assign(exceptionStatus, { applicationStatus: 'approve' });

    await exceptionStatus.save();

    await DGRsendPushMessage(
      { user_id: sid },
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
      { user_id: sid },
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

export const enterException = async (req: Request, res: Response) => {
  const { sid: applier } = req.body;

  const today = getTodayDateString();
  const now = getNowMealTime();
  if (!now) throw new HttpException(401, '점심/저녁시간이 아닙니다.');

  const exception = await MealExceptionModel.findOne({
    $or: [
      { applier },
      {
        appliers: {
          $elemMatch: {
            student: applier,
          },
        },
      },
    ],
    date: today,
    time: now,
  });
  if (!exception) throw new HttpException(401, '현재 시간에 선/후밥 신청한 학생이 없습니다.');

  if (exception.group) {
    await MealExceptionModel.updateOne(
      { _id: exception._id },
      {
        appliers: exception.appliers.map((e) => {
          if (String(e.student) === applier) {
            return {
              student: applier,
              entered: true,
            };
          } return e;
        }),
      },
    );
  } else {
    await MealExceptionModel.updateOne(
      { _id: exception._id },
      { entered: true },
    );
  }

  res.json({ exception });
};

export const getExceptionRemain = async (req: Request, res: Response) => {
  const { date, time } = req.params;

  if (!weekday.includes(date)) throw new HttpException(401, '요일 형태가 올바르지 않습니다.');
  const appliDate = getNextWeekDay(weekday.indexOf(date) + 7);

  const lastMealMaxNum = await getMealConfig(MealConfigKeys.lastMealMaxApplicationPerMeal);
  const exception = await MealExceptionModel.count({
    date: appliDate,
    time: time as MealExceptionTimeType,
  });

  res.json({ remain: lastMealMaxNum - exception });
};
