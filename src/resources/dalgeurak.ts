import { ObjectId } from 'mongodb';
import { HttpException } from '../exceptions';
import { UserModel } from '../models';
import {
  IStudent,
  MealExceptionModel,
  MealOrderModel,
  StudentModel,
} from '../models/dalgeurak';
import { MealTardyStatusType } from '../types';
import { getExtraTime, getNowTime } from './date';

export const reloadDalgeurakStudents = async () => {
  await StudentModel.deleteMany({});
  const users = await UserModel.find({ userType: 'S', serial: { $exists: true } });
  await Promise.all(
    users.map(async (student) => {
      await new StudentModel({
        _id: new ObjectId(student._id),
        idx: student.idx,
        name: student.name,
        grade: student.grade,
        class: student.class,
        number: student.number,
        serial: student.serial,
      }).save();
    }),
  );
};

export const resetStudentMealStatus = async () => {
  await StudentModel.updateMany({}, { status: 'empty' });
};
export const resetMealExceptions = async () => {
  await MealExceptionModel.deleteMany({});
};
export const resetExtraTimes = async () => {
  await MealOrderModel.findOneAndUpdate({ field: 'intervalTime' }, { extraMinute: 0 });
};

export const checkTardy = async (student: IStudent): Promise<MealTardyStatusType> => {
  let mealStatus: MealTardyStatusType;

  const nowTime = getNowTime();

  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  if (nowTime < 1150) return 'beforeLunch';
  if (nowTime > 1400 && nowTime < 1830) return 'beforeDinner';
  if (nowTime > 2000) return 'afterDinner';

  if (student.status !== 'empty') return 'certified';

  const { extraMinute } = await MealOrderModel.findOne({ field: 'intervalTime' });

  type nowType = 'lunch' | 'dinner';
  let now: nowType;

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
      if (exception.applicationStatus === 'permitted') {
        if (exception.exceptionType === 'first') mealStatus = 'onTime'; // 선밥
        else mealStatus = 'early';
      } else mealStatus = exception.applicationStatus as noPermission; // 선후밥 신청 거부/대기 중
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
