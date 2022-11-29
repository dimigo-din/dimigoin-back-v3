/* eslint-disable guard-for-in */
/* eslint-disable camelcase */
import { Request, Response } from 'express';
import { getNowMealTime } from '../../resources/dalgeurak';
import {
  getDayCode,
  getDayToDate,
  getNowTime,
  getTodayDateString,
  getWeekCalcul,
  getWeekdayEndString,
  getWeekStartString,
  format,
} from '../../resources/date';
import io from '../../resources/socket';
import { HttpException } from '../../exceptions';
import { IMealException, MealExceptionBlacklistModel, MealExceptionModel } from '../../models/dalgeurak';
import {
  MealConfigKeys, MealExceptionTimeValues, MealExceptionValues,
} from '../../types';
import { DGRsendPushMessage } from '../../resources/dalgeurakPush';
import { getMealConfig } from '../../resources/config';
import { getStudentInfo, getTeacherInfo, studentSearch } from '../../resources/dimi-api';
import { User } from '../../interfaces';

const weekday = ['sun', 'mon', 'tue', 'wed', 'thr', 'fri', 'sat'];

export const getMealExceptions = async (req: Request, res: Response) => {
  const users = await MealExceptionModel.find({
    date: {
      $gte: getWeekStartString(),
      $lte: getWeekdayEndString(),
    },
  });

  const exceptionAppliers = users.map((e) => e.applier);
  const processedExceptionAppliers = exceptionAppliers.filter((v, i) => exceptionAppliers.indexOf(v) === i);

  const appliersP: Array<number> = [];

  for (const i of users.map((e) => e.appliers)) {
    for (const { student } of i) {
      appliersP.push(student);
    }
  }

  const processedAppliers = appliersP.filter((v, i) => appliersP.indexOf(v) === i);

  const students = await studentSearch({
    user_id: processedExceptionAppliers,
  });
  const appliersStudent = await studentSearch({
    user_id: processedAppliers,
  });

  const u: Array<Omit<Omit<IMealException, 'applier'>, 'appliers'> & {
    applier: User;
    appliers: Array<{
      entered: boolean;
      student: User;
    }>
  }> = [];
  users.forEach((p) => {
    const { applier, appliers } = p;
    delete (p as any)._doc.applier;
    delete (p as any)._doc.appliers;
    const appliersPP: Array<{
      entered: boolean;
      student: User;
    }> = [];
    appliers.forEach((s) => {
      appliersPP.push({
        entered: s.entered,
        student: appliersStudent[appliersStudent.findIndex(({ user_id }) => user_id === s.student)],
      });
    });
    u.push({
      applier: students[students.findIndex(({ user_id }) => user_id === applier)],
      appliers: appliersPP,
      ...(p as any)._doc,
    });
  });

  res.json({ users: u });
};
export const createMealExceptions = async (req: Request, res: Response) => {
  const {
    appliers = [],
    group,
    reason,
    date,
    time,
    type,
  } = req.body;
  const { user_id: applier } = req.user;

  const appliersBlackCheck = await MealExceptionBlacklistModel.count({
    userId: {
      $in: appliers,
    },
  });
  if (appliersBlackCheck > 0) throw new HttpException(401, '블랙리스트에 등록된 멤버가 있습니다.');

  const blackCheck = await MealExceptionBlacklistModel.findOne({
    userId: applier,
  });
  if (blackCheck) throw new HttpException(401, '블랙리스트로 인해 신청할 수 없습니다.');

  const nowTime = getNowTime();
  if (nowTime < 800) throw new HttpException(401, '신청시간이 아닙니다.');

  if (date.length !== time.length && time.length !== type.length) throw new HttpException(401, '데이터의 길이가 일치하지 않습니다.');

  if (appliers.length < 5 && group) throw new HttpException(401, '최소 신청자 수는 다섯 명부터입니다.');

  const today = getDayCode();
  if (['fri', 'sat', 'sun'].includes(today)) throw new HttpException(401, '신청할 수 없는 요일입니다.');

  const firstMealMaxNum = await getMealConfig(MealConfigKeys.firstMealMaxApplicationPerMeal);
  const lastMealMaxNum = await getMealConfig(MealConfigKeys.lastMealMaxApplicationPerMeal);

  for (const i in date) {
    const appliDate = getDayToDate(weekday.indexOf(date[i]) + 7);

    if (!MealExceptionValues.includes(type[i])) throw new HttpException(401, 'type parameter 종류 first 또는 last 이여야 합니다.');
    if (!MealExceptionTimeValues.includes(time[i])) throw new HttpException(401, 'time 형태가 올바르지 않습니다.');

    if (!weekday.includes(date[i])) throw new HttpException(401, '요일 형태가 올바르지 않습니다.');

    const exceptionMealCount = await MealExceptionModel.count({
      exceptionType: type[i],
      date: appliDate,
      time: time[i],
    });
    if (group && exceptionMealCount + appliers.length >= (type === 'first' ? firstMealMaxNum : lastMealMaxNum)) {
      throw new HttpException(401, `${
        (exceptionMealCount + appliers.length) - (type === 'first' ? firstMealMaxNum : lastMealMaxNum)
      }명 초과하였습니다.`);
    } else if (!group && exceptionMealCount >= (type === 'first' ? firstMealMaxNum : lastMealMaxNum)) {
      throw new HttpException(401, '신청인원수를 초과하였습니다.');
    }
  }

  for (const i in date) {
    const appliDate = getDayToDate(weekday.indexOf(date[i]) + 7);

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
      time: time[i],
      date: appliDate,
    });
    if (exceptionStatus) {
      for (const j of appliers) {
        if (exceptionStatus.appliers.findIndex((e) => e.student === j) !== -1) {
          const s = await getStudentInfo(j);
          throw new HttpException(
            401,
            group ? `${s.name} 학생이 이미 신청되어 있습니다.` : '이미 신청하였습니다.',
          );
        }
      }
    }

    await new MealExceptionModel({
      exceptionType: type[i],
      applier,
      appliers: appliers.map((e: string) => ({ student: e, entered: false })),
      reason,
      time: time[i],
      group,
      date: appliDate,
      // applicationStatus: type === 'last' ? 'approve' : 'waiting',
      applicationStatus: 'approve',
    }).save();
  }

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

  res.json({ date });
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

  const blackCheck = await MealExceptionBlacklistModel.findOne({
    userId: sid,
  });
  if (blackCheck) throw new HttpException(401, '블랙리스트로 인해 신청할 수 없습니다.');

  const teacher = await getTeacherInfo(req.user.user_id);

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
          if (e.student === applier) {
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
  interface LunchDinner {
    lunch: {
      first: number;
      last: number;
    };
    dinner: {
      first: number;
      last: number;
    };
  }

  const exceptionWeekday = weekday.slice(1, 6);
  const remain: {
    [key: typeof exceptionWeekday[number]]: LunchDinner
  } = exceptionWeekday.reduce((p, e) => ({
    ...p,
    [e]: {
      lunch: {
        first: 0,
        last: 0,
      },
      dinner: {
        first: 0,
        last: 0,
      },
    },
  }), {});

  const firstMealMaxNum = await getMealConfig(MealConfigKeys.firstMealMaxApplicationPerMeal);
  const lastMealMaxNum = await getMealConfig(MealConfigKeys.lastMealMaxApplicationPerMeal);

  for (const day of exceptionWeekday) {
    const appliDate = getDayToDate(weekday.indexOf(day) + 7);
    const firstLunchException = await MealExceptionModel.count({
      date: appliDate,
      time: 'lunch',
    });
    remain[day].lunch.first = firstMealMaxNum - firstLunchException;

    const lastLunchException = await MealExceptionModel.count({
      date: appliDate,
      time: 'lunch',
    });
    remain[day].lunch.last = lastMealMaxNum - lastLunchException;

    const firstDinnerException = await MealExceptionModel.count({
      date: appliDate,
      time: 'dinner',
    });
    remain[day].dinner.first = firstMealMaxNum - firstDinnerException;

    const lastDinnerException = await MealExceptionModel.count({
      date: appliDate,
      time: 'dinner',
    });
    remain[day].dinner.last = lastMealMaxNum - lastDinnerException;
  }

  res.json({ ...remain });
};

export const addBlackList = async (req: Request, res: Response) => {
  const { sid } = req.body;

  const blackCheck = await MealExceptionBlacklistModel.findOne({
    userId: sid,
  });
  if (blackCheck) throw new HttpException(401, '이미 블랙리스트에 존재합니다.');

  await new MealExceptionBlacklistModel({
    userId: sid,
  }).save();

  res.json({ userId: sid });
};

export const deleteBlackList = async (req: Request, res: Response) => {
  const { sid } = req.body;

  await MealExceptionBlacklistModel.deleteOne({
    userId: sid,
  });

  res.json({ userId: sid });
};

export const getMyExceptions = async (req: Request, res: Response) => {
  const { user_id: applier } = req.user;

  const exceptions = await MealExceptionModel.find({
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
    applicationStatus: {
      $ne: 'reject',
    },
    date: {
      $gte: getWeekStartString(),
      $lte: getWeekCalcul(11).format(format),
    },
  });

  res.json({ exceptions });
};
