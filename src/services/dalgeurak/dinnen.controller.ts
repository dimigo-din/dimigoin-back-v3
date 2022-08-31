import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { HttpException } from '../../exceptions';
import { UserModel } from '../../models';
import { checkTardy } from '../../resources/dalgeurak';
import { mealStatusFilter } from './controllers';
import { CheckinLogModel, MealOrderModel } from '../../models/dalgeurak';
import { getNowTimeString } from '../../resources/date';
import io from '../../resources/socket';
import { DGRsendPushMessage } from '../../resources/dalgeurakPush';

export const entranceProcess = async (req: Request, res: Response) => {
  const { sid } = req.body;

  const student = await UserModel.findById(sid);
  if (!student) throw new HttpException(404, '학생을 찾을 수 없습니다.');

  const mealStatus = await checkTardy(student);
  mealStatusFilter(mealStatus);

  Object.assign(student, { mealStatus });
  await student.save();
  await new CheckinLogModel({
    date: getNowTimeString(),
    student: new ObjectId(student._id),
    status: mealStatus,
    class: student.class,
    grade: student.grade,
  }).save();

  res.json({ mealStatus });
  io.of('/dalgeurak').to('mealStatus').emit('mealStatus', {
    _id: student._id,
    mealStatus,
  });
};

// 대기줄 변경
export const updateWaitingLine = async (req: Request, res: Response) => {
  const { position } = req.body;
  await MealOrderModel.updateOne(
    { field: 'waitingLine' },
    { position },
  );

  res.json({ position });
};

// 권한포함 학생정보 불러오기
export const getAllStudents = async (req: Request, res: Response) => {
  const students = await UserModel.find({
    userType: 'S',
    serial: { $ne: null },
  }).sort('serial')
    .select('name')
    .select('serial')
    .select('class')
    .select('grade')
    .select('number')
    .select('permissions');

  res.json({ students });
};

// 급식 상태 모두 불러오기
export const getMealStatuses = async (req: Request, res: Response) => {
  const students = await UserModel.find({ grade: { $in: [1, 2] } });

  interface mealStatusIF {
    [key: string]: string;
  }
  const mealStatuses: mealStatusIF = {};
  students.forEach((student) => {
    mealStatuses[student._id] = student.mealStatus;
  });

  res.json({ mealStatuses });
};

// 테스트 코드
export const alertTest = async (req: Request, res: Response) => {
  const { title, message } = req.body;
  await DGRsendPushMessage(
    { _id: req.user._id },
    title,
    message,
  );

  res.json({ title, message });
};
