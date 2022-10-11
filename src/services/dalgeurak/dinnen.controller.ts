import { Request, Response } from 'express';
import { PermissionModel } from '../../models';
import { HttpException } from '../../exceptions';
import { checkTardy } from '../../resources/dalgeurak';
import { mealStatusFilter } from './controllers';
import { CheckinLogModel, MealConfigModel, MealStatusModel } from '../../models/dalgeurak';
import { getNowTimeString } from '../../resources/date';
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
  const permissions = await PermissionModel.find({
    userId: {
      $in: students.map((e) => e.user_id),
    },
  });

  students.forEach((e, idx) => {
    if (permissions.findIndex((p) => p.userId === e.user_id) !== -1) {
      (students[idx] as any).permissions = permissions[permissions.findIndex((p) => p.userId === e.user_id)].permissions;
    } else {
      (students[idx] as any).permissions = [];
    }
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
