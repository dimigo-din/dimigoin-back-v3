import { Request, Response } from 'express';
import Jwt from 'jsonwebtoken';
import { HttpException } from '../../exceptions';
import config from '../../config';
import {
  CheckinLogModel,
  MealExceptionModel,
  MealStatusModel,
} from '../../models/dalgeurak';
import {
  MealStatusType,
  MealTardyStatusType,
} from '../../types';
import {
  getNowTimeString,
} from '../../resources/date';
import { checkTardy } from '../../resources/dalgeurak';
import io from '../../resources/socket';
import { getStudentInfo } from '../../resources/dimi-api';

export const mealStatusFilter = (mealStatus: MealTardyStatusType): void => {
  switch (mealStatus) {
    case 'beforeLunch':
      throw new HttpException(401, '점심 시간 전 입니다.');
    case 'beforeDinner':
      throw new HttpException(401, '저녁 시간 전 입니다.');
    case 'afterDinner':
      throw new HttpException(401, '저녁시간이 지났습니다.');
    case 'certified':
      throw new HttpException(401, '이미 인증된 사용자입니다.');
    case 'early':
      throw new HttpException(401, '아직 반 식사시간이 아닙니다.');
    case 'waiting':
      throw new HttpException(401, '선/후밥 신청 대기 중 입니다.');
    case 'rejected':
      throw new HttpException(401, '선/후밥 신청이 거부되었습니다.');
    default:
      break;
  }
};

interface IQRkey {
  studentId: string;
  randomValue: string;
}

const getQRToken = async (key: string): Promise<IQRkey> => {
  try {
    const decoded = await Jwt.verify(key, config.dalgeurakKey) as IQRkey;
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new HttpException(401, '토큰이 만료되었습니다.');
    } else if (['jwt malformed', 'invalid signature'].includes(error.message)) {
      throw new HttpException(401, '토큰이 변조되었습니다.');
    } else throw new HttpException(401, '토큰에 문제가 있습니다.');
  }
};

// 입장
export const checkEntrance = async (req: Request, res: Response) => {
  const { key } = req.body;
  const decoded = await getQRToken(key);
  const student = await getStudentInfo(+decoded.studentId);
  if (!student) throw new HttpException(404, '학생 정보를 읽을 수가 없습니다.');

  const mealStatusType = await MealStatusModel.findOne({ userId: student.user_id });

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

  res.json({ mealStatus, name: student.name });
  io.of('/dalgeurak').to('mealStatus').emit('mealStatus', {
    _id: req.user.user_id,
    mealStatus,
  });
};

// 내 정보
export const getUserInfo = async (req: Request, res: Response) => {
  const student = await getStudentInfo(req.user.user_id);
  const exception = await MealExceptionModel.findOne({ applier: req.user.user_id });

  const mealStatusType = await MealStatusModel.findOne({ userId: student.user_id });

  const mealStatus = await checkTardy({
    grade: student.grade,
    class: student.class,
    user_id: student.user_id,
    mealStatus: mealStatusType.mealStatus as string,
  });
  const QRkey = await Jwt.sign({
    studentId: student.user_id,
    randomValue: String(Math.random()),
  }, config.dalgeurakKey, {
    expiresIn: '33s',
  });

  res.json({
    mealStatus,
    exception: exception ? exception.exceptionType : 'normal',
    QRkey,
  });
};

// 체크인 로그
export const getCheckInLog = async (req: Request, res: Response) => {
  const { targetGrade, targetClass, targetNumber } = req.params;

  const checkinlog = await CheckinLogModel.find({
    ...(targetGrade !== 'all' && { grade: parseInt(targetGrade) }),
    ...(targetClass !== 'all' && { class: parseInt(targetClass) }),
    ...(targetNumber !== 'all' && { number: parseInt(targetNumber) }),
  });

  checkinlog.forEach(async (e, idx) => {
    (checkinlog[idx].student as any) = await getStudentInfo(e.student);
  });

  res.json({ checkinlog });
};

export const getStudent = async (req: Request, res: Response) => {
  const { student } = req.query;

  const {
    grade,
    class: kclass,
    serial,
    name,
  } = await getStudentInfo(+student);

  res.json({
    user: {
      grade,
      class: kclass,
      serial,
      name,
    },
  });
};
