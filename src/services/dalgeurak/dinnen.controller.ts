import { Request, Response } from 'express';
import { PermissionModel } from '../../models';
import { HttpException } from '../../exceptions';
import { checkTardy } from '../../resources/dalgeurak';
import { mealStatusFilter } from './controllers';
import {
  CheckinLogModel, ConvenienceBlacklistModel, MealConfigModel, MealExceptionBlacklistModel, MealExceptionModel, MealStatusModel,
} from '../../models/dalgeurak';
import { getExcpTime, getNowTimeString, getTodayDateString } from '../../resources/date';
import io from '../../resources/socket';
import { DGRsendPushMessage } from '../../resources/dalgeurakPush';
import { MealConfigKeys, MealStatusType } from '../../types';
import { getAllStudents, getStudentInfo, studentSearch } from '../../resources/dimi-api';

export const entranceProcess = async (req: Request, res: Response) => {
  const { sid } = req.body;

  const student = await getStudentInfo(sid);
  if (!student) throw new HttpException(404, '학생을 찾을 수 없습니다.');

  const mealStatusType = await MealStatusModel.findOne({ userId: sid });

  const mealStatus = await checkTardy({
    grade: student.grade,
    class: student.class,
    user_id: student.user_id,
    mealStatus: mealStatusType.mealStatus as string,
  });
  mealStatusFilter(mealStatus);

  // Object.assign(student, { mealStatus });
  // await student.save();
  await MealStatusModel.updateOne(
    { userId: student.user_id },
    { mealStatus: mealStatus as MealStatusType },
  );
  await new CheckinLogModel({
    date: getNowTimeString(),
    student: student.user_id,
    status: mealStatus,
    class: student.class,
    grade: student.grade,
  }).save();

  res.json({ mealStatus });
  io.of('/dalgeurak').to('mealStatus').emit('mealStatus', {
    user_id: student.user_id,
    mealStatus,
  });
};

// 대기줄 변경
export const updateWaitingLine = async (req: Request, res: Response) => {
  const { position } = req.body;
  await MealConfigModel.updateOne(
    { key: MealConfigKeys.waitingLine },
    { value: position },
  );

  res.json({ position });
};

// 권한포함 학생정보 불러오기
export const DGLgetAllStudents = async (req: Request, res: Response) => {
  const students = await getAllStudents();

  const users = students.map((e) => e.user_id);

  const permissions = await PermissionModel.find({
    userId: {
      $in: users,
    },
  });

  const convenienceBlack = await ConvenienceBlacklistModel.find({
    userId: {
      $in: users,
    },
  });
  const exceptionBlack = await MealExceptionBlacklistModel.find({
    userId: {
      $in: users,
    },
  });

  students.forEach((e, idx) => {
    if (permissions.findIndex((p) => p.userId === e.user_id) !== -1) {
      (students[idx] as any).permissions = permissions[permissions.findIndex((p) => p.userId === e.user_id)].permissions;
    } else {
      (students[idx] as any).permissions = [];
    }
    if (convenienceBlack.findIndex((b) => b.userId === e.user_id) !== -1) (students[idx] as any).convenienceBlack = true;
    else (students[idx] as any).convenienceBlack = false;

    if (exceptionBlack.findIndex((x) => x.userId === e.user_id) !== -1) (students[idx] as any).exceptionBlack = true;
    else (students[idx] as any).exceptionBlack = false;
  });

  res.json({ students });
};

// 급식 상태 모두 불러오기
export const getMealStatuses = async (req: Request, res: Response) => {
  const students = await studentSearch({ grade: [1, 2] });

  interface mealStatusIF {
    [key: string]: string;
  }
  const mealStatuses: mealStatusIF = {};
  students.forEach(async (student) => {
    const { mealStatus } = await MealStatusModel.findOne({ userId: student.user_id });
    mealStatuses[student.user_id] = mealStatus;
  });

  res.json({ mealStatuses });
};

// 테스트 코드
export const alertTest = async (req: Request, res: Response) => {
  const { title, message } = req.body;
  await DGRsendPushMessage(
    { user_id: req.user.user_id },
    title,
    message,
  );

  res.json({ title, message });
};

// 후밥 알림 보내기
export const alertExceptionLast = async (req: Request, res: Response) => {
  const nowTime = getExcpTime();
  if (nowTime) throw new HttpException(401, '식사 시간이 아닙니다.');

  const exception = await MealExceptionModel.find({
    time: nowTime,
    date: getTodayDateString(),
  });

  const appliers = exception.map((e) => e.applier);
  const processedAppliers = appliers.filter((v, i) => appliers.indexOf(v) === i);

  await DGRsendPushMessage(
    { user_id: processedAppliers },
    '후밥 알림',
    '지금 후밥 먹으로 와주세요',
  );

  const sids: Array<number> = [];
  for (const n of exception.map((e) => e.appliers).map((e) => e.map((s) => !s.entered && s.student)).filter((e) => e)) {
    sids.push(...n);
  }

  await DGRsendPushMessage(
    { user_id: sids.filter((e) => e) },
    '후밥 알림',
    '지금 후밥 먹으러 와주세요',
  );

  res.json({ success: true });
};
