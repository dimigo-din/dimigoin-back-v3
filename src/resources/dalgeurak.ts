import { UserModel } from '../models';
import { HttpException } from '../exceptions';
import {
  MealExceptionModel,
  MealOrderModel,
} from '../models/dalgeurak';
import { MealExceptionTimeType, MealTardyStatusType } from '../types';
import { getExtraTime, getNowTime } from './date';

export const resetStudentsMealStatus = async () => {
  await UserModel.updateMany({ userType: 'S' }, { mealStatus: 'empty' });
};
export const resetExtraTimes = async () => {
  await MealOrderModel.findOneAndUpdate({ field: 'intervalTime' }, { extraMinute: 0 });
};
export const resetFMTicket = async () => {
  await UserModel.updateMany({ userType: 'S' }, { fmticket: 2 });
};

interface Istudent {
  mealStatus: string;
  grade: number;
  class: number;
  serial: number;
}
export const checkTardy = async (student: Istudent): Promise<MealTardyStatusType> => {
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

  const { extraMinute } = await MealOrderModel.findOne({ field: 'intervalTime' });

  let now: MealExceptionTimeType;

  if (nowTime >= 1150 && nowTime <= 1400) now = 'lunch';
  else if (nowTime >= 1830) now = 'dinner';

  const gradeIdx = student.grade - 1;
  const classIdx = mealSequences[now][gradeIdx].indexOf(student.class);
  const extraTime = getExtraTime(extraMinute, mealTimes[now][gradeIdx][classIdx]); // 본인 반의 밥시간
  let nextExtraTime; // 다음 반의 밥시간

  if (classIdx === 5) nextExtraTime = getExtraTime(extraMinute + 3, mealTimes[now][gradeIdx][classIdx]); // 순서가 마지막일 때 반 시간에서 3분 추가
  else nextExtraTime = getExtraTime(extraMinute, mealTimes[now][gradeIdx][classIdx + 1]); // 다음 반 밥시간

  type noPermission = 'rejected' | 'waiting';

  const exception = await MealExceptionModel.findOne({ serial: student.serial });
  if (nowTime < extraTime) {
    if (exception) {
      if (exception.applicationStatus === 'permitted' && exception.time === now) {
        if (exception.exceptionType === 'first') mealStatus = 'onTime'; // 선밥
        else mealStatus = 'early';
      } else mealStatus = exception.applicationStatus as noPermission; // 선후밥 신청 거부/대기 중0
    } else mealStatus = 'early';
  } else if (nowTime >= extraTime && nowTime < nextExtraTime) mealStatus = 'onTime';
  else if (nowTime >= nextExtraTime) {
    if (exception) {
      if (exception.exceptionType === 'last' && exception.applicationStatus === 'permitted') mealStatus = 'onTime'; // 후밥
      else if (exception.exceptionType === 'first') mealStatus = 'tardy';
      else mealStatus = exception.applicationStatus as noPermission;
    }
    else mealStatus = 'tardy'; // 지각
  }

  return mealStatus;
};

export const getOrder = async () => {
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  const nowTime = await getNowTime();

  type nowType = 'lunch' | 'dinner';
  let now: nowType;
  if (nowTime >= 1150 && nowTime <= 1400) now = 'lunch';
  else if (nowTime >= 1830) now = 'dinner';

  let gradeIdx: number;
  let classIdx: number;
  for (let i = 0; i < mealTimes[now].length; i += 1) {
    if (nowTime >= mealTimes[now][i][5]) {
      gradeIdx = i;
      classIdx = 5;
      break;
    }
    for (let j = 0; j < mealTimes[now][i].length - 1; j += 1) {
      if (nowTime >= mealTimes[now][i][j] && nowTime < mealTimes[now][i][j + 1]) {
        gradeIdx = i;
        classIdx = j;
        break;
      }
    }
  }

  return { gradeIdx, classIdx, now };
};
