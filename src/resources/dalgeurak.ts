/* eslint-disable no-useless-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import { HttpException } from '../exceptions';
import {
  MealExceptionModel,
  MealOrderModel,
  MealConfigModel,
  ConvenienceFoodModel,
  ConvenienceCheckinModel,
  ConvenienceDepriveModel,
  FriDayHomeModel,
  MealExceptionDepriveModel,
} from '../models/dalgeurak';
import {
  MealTardyStatusType,
  ConvenienceTimeValues,
  ConvenienceFoodValues,
  ConvenienceFoodType,
  MealConfigKeys,
  MealTimeType,
} from '../types';
import {
  getConvAppliEndString,
  getExtraTime,
  getLastWeek,
  getNowTime,
  getTodayDateString,
  getWeekdayEndString,
  getWeekStartString,
} from './date';
import logger from './logger';

export const getMealConfig = async (key: string) =>
  (await MealConfigModel.findOne({ key })).value;

export const resetExtraTimes = async () => {
  await MealConfigModel.findOneAndUpdate(
    { key: MealConfigKeys.intervalTime },
    { value: 0 },
  );
};

export const getNowMealTime = (): 'lunch' | 'dinner' => {
  const nowTime = getNowTime();
  if (nowTime >= 1150 && nowTime <= 1400) return 'lunch';
  if (nowTime >= 1830) return 'dinner';
};

export const setConvenienceFood = async () => {
  const foods: ConvenienceFoodType[][] = [
    [...ConvenienceFoodValues],
    ['salad', 'misu'],
  ];
  const foodname = {
    sandwich: '샌드위치',
    salad: '샐러드',
    misu: '선식',
  };
  const convenienceLimit = await getMealConfig(MealConfigKeys.convenienceApplicationLimit);
  ConvenienceTimeValues.map(async (time, idx) =>
    foods[idx].map(
      async (food) =>
        await new ConvenienceFoodModel({
          time,
          food,
          name: foodname[food],
          limit: convenienceLimit,
          remain: convenienceLimit,
          applications: [],
          duration: {
            start: getWeekStartString(),
            end: getWeekdayEndString(),
            applicationend: getConvAppliEndString(),
          },
        }).save(),
    ));

  await new ConvenienceCheckinModel({
    duration: {
      start: getWeekStartString(),
      end: getWeekdayEndString(),
    },
    breakfast: [],
    dinner: [],
  }).save();
};

export const convenienceDepriveCheck = async () => {
  await ConvenienceDepriveModel.deleteMany({ clear: true }); // 한 번 신청 시도했을 때 신청기회 제공

  const checkin = await ConvenienceCheckinModel.findOne({
    // 저번주 체크인 기록
    'duration.start': getLastWeek(getWeekStartString()),
  });
  const breakfastFoods = await ConvenienceFoodModel.find({
    // 저저번주 신청 기록
    time: 'breakfast',
    'duration.start': getLastWeek(getLastWeek(getWeekStartString())),
  });
  const dinnerFoods = await ConvenienceFoodModel.find({
    time: 'dinner',
    'duration.start': getLastWeek(getLastWeek(getWeekStartString())),
  });

  const breakfastCheckin = checkin.breakfast.map((e) => e.student);
  breakfastFoods.forEach((food) => {
    food.applications
      .map((e) => e.student)
      .forEach(async (student) => {
        if (breakfastCheckin.filter((s) => s === student).length <= 3) {
          // 일주일에 간편식 식사수가 3회 이하일 때 (평일 공휴일 고려하지 않음.)
          await new ConvenienceDepriveModel({
            student,
            clear: false,
          }).save();
        }
      });
  });

  const dinnerCheckin = checkin.dinner.map((e) => e.student);
  dinnerFoods.forEach((food) => {
    food.applications
      .map((e) => e.student)
      .forEach(async (student) => {
        if (dinnerCheckin.filter((s) => s === student).length <= 3) {
          await new ConvenienceDepriveModel({
            student,
            clear: false,
          }).save();
        }
      });
  });
};

export const mealExceptionDepriveCheck = async () => {
  await MealExceptionDepriveModel.deleteMany({ clear: true }); // 한 번 신청 시도했을 때 신청기회 제공

  const exceptions = await MealExceptionModel.find({
    date: {
      $gte: getLastWeek(getWeekStartString()),
      $lte: getLastWeek(getWeekdayEndString()),
    },
  });

  const depriveList: Array<number> = [];
  exceptions.forEach((exception) => {
    if (exception.group) {
      exception.appliers.forEach(({ student, entered }) => {
        if (!entered) depriveList.push(student);
      });
    } else if (!exception.entered) depriveList.push(exception.applier);
  });

  const listCount: {
    [key: number]: number
  } = {};
  depriveList.forEach((student) => {
    listCount[student] = (listCount[student] || 0) + 1;
  });

  Object.keys(listCount).forEach(async (student) => {
    if (listCount[+student] >= 2) {
      await new MealExceptionDepriveModel({
        student: +student,
        clear: false,
      }).save();
    }
  });
};

interface Istudent {
  mealStatus: string;
  grade: number;
  class: number;
  user_id: number;
}
export const checkTardy = async (
  student: Istudent,
): Promise<MealTardyStatusType> => {
  let mealStatus: MealTardyStatusType;

  const nowTime = getNowTime();

  if (nowTime < 1150) return 'beforeLunch';
  if (nowTime > 1400 && nowTime < 1830) return 'beforeDinner';
  if (nowTime > 2000) return 'afterDinner';

  if (student.mealStatus !== 'empty') return 'certified';

  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  const extraMinute = await getMealConfig(MealConfigKeys.intervalTime);

  const now = getNowMealTime();

  const gradeIdx = student.grade - 1;
  const classIdx = mealSequences[now][gradeIdx].indexOf(student.class);
  const extraTime = getExtraTime(
    extraMinute,
    mealTimes[now][gradeIdx][classIdx],
  ); // 본인 반의 밥시간
  const nextExtraTime = classIdx === 5
    ? getExtraTime(extraMinute + 3, mealTimes[now][gradeIdx][classIdx]) //  // 순서가 마지막일 때 반 시간에서 3분 추가
    : getExtraTime(extraMinute, mealTimes[now][gradeIdx][classIdx + 1]); // 다음 반의 밥시간

  type noPermission = 'rejected' | 'waiting';

  const exception = await MealExceptionModel.findOne({
    $or: [
      { applier: student.user_id },
      {
        appliers: {
          $elemMatch: {
            student: student.user_id,
          },
        },
      },
    ],
  });
  if (nowTime < extraTime) {
    if (exception) {
      if (exception.applicationStatus === 'approve' && exception.time === now) {
        if (exception.exceptionType === 'first') mealStatus = 'onTime'; // 선밥
        else mealStatus = 'early';
      } else mealStatus = exception.applicationStatus as noPermission; // 선후밥 신청 거부/대기 중0
    } else mealStatus = 'early';
  } else if (nowTime >= extraTime && nowTime < nextExtraTime) mealStatus = 'onTime';
  else if (nowTime >= nextExtraTime) {
    if (exception) {
      if (
        exception.exceptionType === 'last'
        && exception.applicationStatus === 'approve'
      ) mealStatus = 'onTime'; // 후밥
      else if (exception.exceptionType === 'first') mealStatus = 'tardy';
      else mealStatus = exception.applicationStatus as noPermission;
    } else mealStatus = 'tardy'; // 지각
  }

  return mealStatus;
};

export const getOrder = async () => {
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });

  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  const nowTime = await getNowTime();
  const now: MealTimeType = nowTime >= 1150 && nowTime <= 1400 ? 'lunch' : nowTime >= 1830 ? 'dinner' : null;

  if (!now) throw new HttpException(401, '식사시간이 아닙니다.');

  let gradeIdx = 0;
  let classIdx = 0;

  let thisEnd: boolean = false;

  mealTimes[now].forEach((grade, i) => {
    if (thisEnd) return;
    grade.forEach((time, j) => {
      if (nowTime >= time) {
        gradeIdx = i;
        classIdx = j;
        thisEnd = true;
        return;
      }
    });
  });

  return { gradeIdx, classIdx, now };
};

export const fridayHomeCheck = async () => {
  const today = getTodayDateString();
  const fri = getWeekdayEndString();

  if (today !== fri) return logger.error('오늘날짜와 금요일 날짜가 다릅니다. [달그락 : 금요귀가자 체크]');

  const fridayAppliers = await FriDayHomeModel.find({
    date: today,
  });

  fridayAppliers.map(async (e) => {
    ConvenienceTimeValues.map(async (time) => {
      const conveniences = await ConvenienceFoodModel.find({
        time,
        'duration.start': getLastWeek(getWeekStartString()),
        applications: {
          $elemMatch: {
            student: e.userId,
          },
        },
      });
      if (conveniences.length > 0) {
        const checkInCheck = await ConvenienceCheckinModel.findOne({
          'duration.start': getWeekStartString(),
        });
        if (!checkInCheck) return; // 이번 주 체크인이 설정되어 있지 않음.

        await ConvenienceCheckinModel.updateOne(
          { _id: checkInCheck._id },
          {
            [time]: [...checkInCheck[time], {
              date: getTodayDateString(),
              student: e.userId,
            }],
          },
        );
      }
    });

    const mealExceptions = await MealExceptionModel.find({
      $or: [
        {
          applier: e.userId,
        },
        {
          appliers: {
            $elemMatch: {
              student: e.userId,
            },
          },
        },
      ],
      date: today,
    });
    if (mealExceptions.length > 0) {
      mealExceptions.map(async (exception) => {
        if (exception.group) {
          await MealExceptionModel.updateOne(
            { _id: exception._id },
            {
              appliers: exception.appliers.map((e1) => {
                if (e1.student === e.userId) {
                  return {
                    student: e.userId,
                    entered: true,
                  };
                } return e1;
              }),
            },
          );
        } else {
          await MealExceptionModel.updateOne(
            { _id: exception._id },
            { entered: true },
          );
        }
      });
    }
  });
};
