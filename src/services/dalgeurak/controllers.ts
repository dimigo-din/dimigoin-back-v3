import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import Jwt from 'jsonwebtoken';
import { HttpException } from '../../exceptions';
import config from '../../config';
import {
  CheckinLogModel,
  MealExceptionModel,
  MealOrderModel,
} from '../../models/dalgeurak';
import { UserModel } from '../../models';
import {
  ClassType,
  MealExceptionValues,
  MealTardyStatusType,
  MealTimeType,
} from '../../types';
import { getExtraTime, getNowTime, getNowTimeString } from '../../resources/date';
import { checkTardy } from '../../resources/dalgeurak';
import { WarningModel } from '../../models/dalgeurak/warning';
import { DGLsendPushMessage } from '../../resources/dalgeurakPush';

const mealStatusFilter = (mealStatus: MealTardyStatusType): void => {
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
  const student = await UserModel.findById(decoded.studentId);
  if (!student) throw new HttpException(404, '학생 정보를 읽을 수가 없습니다.');

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

  res.json({ mealStatus, name: student.name });
};

// 디넌용 입장처리
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
};

// 현재 급식 받고 있는 반
export const getNowSequence = async (req: Request, res: Response) => {
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  const nowTime = await getNowTime();

  if (nowTime < 1150) throw new HttpException(401, '점심 시간 전 입니다.');
  if (nowTime > 1400 && nowTime < 1830) throw new HttpException(401, '저녁 시간 전 입니다.');
  if (nowTime > 2000) throw new HttpException(401, '저녁시간이 지났습니다.');

  type nowType = 'lunch' | 'dinner';
  let now: nowType;
  if (nowTime >= 1150 && nowTime <= 1400) now = 'lunch';
  else if (nowTime >= 1830) now = 'dinner';

  let gradeIdx: number;
  let classIdx: number;
  /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
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

  res.json({
    nowSequence: mealSequences[now][gradeIdx][classIdx],
    grade: gradeIdx + 1,
  });
};

// 내 정보
export const getUserInfo = async (req: Request, res: Response) => {
  const student = await UserModel.findById(req.user._id);
  const exception = await MealExceptionModel.findOne({ applier: req.user._id });
  const mealStatus = await checkTardy(student);
  const QRkey = await Jwt.sign({
    studentId: student._id,
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

// 지연시간
export const editExtraTime = async (req: Request, res: Response) => {
  const { extraMinute } = req.body;
  await MealOrderModel.findOneAndUpdate({ field: 'intervalTime' }, { extraMinute });

  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  const nowTime = await getNowTime();

  if (nowTime < 1150) throw new HttpException(401, '점심 시간 전 입니다.');
  if (nowTime > 1400 && nowTime < 1830) throw new HttpException(401, '저녁 시간 전 입니다.');
  if (nowTime > 2000) throw new HttpException(401, '저녁시간이 지났습니다.');

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

  for (let i = gradeIdx; i >= 0; i -= 1) {
    await DGLsendPushMessage(
      {
        grade: gradeIdx + 1,
        class: { $in: i === gradeIdx ? mealSequences[now][i].splice(classIdx + 1, mealSequences[now][i].length - 1) : mealSequences[now][i] },
      },
      '급식 지연 알림',
      `급식 시간이 ${extraMinute}분 지연되었습니다.`,
    );
  }

  res.json({ extraMinute });
};
export const getMealExtraTimes = async (req: Request, res: Response) => {
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  const { extraMinute } = await MealOrderModel.findOne({ field: 'intervalTime' });

  const ExtraLunch = mealTimes.lunch.map((grade: number[]) => grade.map((time: number) => getExtraTime(extraMinute, time)));
  const ExtraDinner = mealTimes.dinner.map((grade: number[]) => grade.map((time: number) => getExtraTime(extraMinute, time)));

  res.json({
    ExtraLunch,
    ExtraDinner,
    extraMinute,
  });
};

// 선/후밥
export const getMealExceptions = async (req: Request, res: Response) => {
  const users = await MealExceptionModel.find({ }).populate('applier');

  res.json({ users });
};
export const createMealExceptions = async (req: Request, res: Response) => {
  const { type } = req.params;
  const { reason } = req.body;
  const { _id } = req.user;
  if (!MealExceptionValues.includes(type)) throw new HttpException(401, 'type parameter 종류는 first 또는 last 이어야 합니다.');

  const exceptionStatus = await MealExceptionModel.findOne({ applier: _id });
  if (exceptionStatus) throw new HttpException(401, '이미 등록되어 있습니다.');

  const exception = await new MealExceptionModel({
    exceptionType: type,
    applier: _id,
    reason,
  }).save();

  res.json({ exception });
};
export const cancelMealException = async (req: Request, res: Response) => {
  const { _id } = req.user;
  const exception = await MealExceptionModel.findOne({ applier: _id });
  if (!exception) throw new HttpException(404, '선/후밥 신청 데이터를 찾을 수 없습니다.');

  await exception.deleteOne();
  res.json({ exception });
};
export const permissionMealException = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user._id);
  if (!(user.userType === 'T' || user.userType === 'D')) throw new HttpException(401, '선생님만 이용할 수 있는 기능입니다.');

  const { sid, permission } = req.body;

  const exception = await MealExceptionModel.findOne({ applier: sid });
  if (!exception) throw new HttpException(404, '신청 데이터를 찾을 수 없습니다.');

  Object.assign(exception, { applicationStatus: permission });

  await DGLsendPushMessage(
    { _id: sid },
    `${exception.exceptionType === 'first' ? '선밥' : '후밥'} 신청 알림`,
    `${exception.exceptionType === 'first' ? '선밥' : '후밥'} 신청이 ${
      permission === 'permitted' ? '허가'
        : permission === 'rejected' && '거부'
    } 되었습니다.`,
  );

  await exception.save();
  res.json({ exception });
};
export const giveMealException = async (req: Request, res: Response) => {
  const teacher = await UserModel.findById(req.user._id);
  if (!(teacher.userType === 'T' || teacher.userType === 'D')) throw new HttpException(401, '선생님만 이용할 수 있는 기능입니다.');

  const { type, sid, reason } = req.body;

  const exceptionStatus = await MealExceptionModel.findOne({ applier: sid });
  if (exceptionStatus) {
    Object.assign(exceptionStatus, { applicationStatus: 'permitted' });

    await exceptionStatus.save();

    await DGLsendPushMessage(
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

    await DGLsendPushMessage(
      { _id: sid },
      `${type === 'first' ? '선밥' : '후밥'} 안내`,
      `${teacher.name} 선생님에 의해 ${type === 'first' ? '선밥' : '후밥'} 처리가 되었습니다.`,
    );

    res.json({ exception });
  }
};

// 급식 순서 & 시간
export const getMealSequences = async (req: Request, res: Response) => {
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  res.json({ mealSequences });
};
export const getMealTimes = async (req: Request, res: Response) => {
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  res.json({ mealTimes });
};

export const editMealSequences = async (req: Request, res: Response) => {
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  Object.assign(mealSequences, req.body);
  await mealSequences.save();

  res.json({ mealSequences });
};
export const editMealTimes = async (req: Request, res: Response) => {
  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  Object.assign(mealTimes, req.body);
  await mealTimes.save();

  res.json({ mealTimes });
};

export const editGradeMealSequences = async (req: Request, res: Response) => {
  interface GradeMealSequences {
    time: MealTimeType;
    sequences: ClassType;
  }

  const gradeIdx = parseInt(req.params.grade) - 1;
  const { time, sequences }: GradeMealSequences = req.body;

  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  mealSequences[time].splice(gradeIdx, 1, sequences);
  Object.assign(mealSequences, {
    ...mealSequences,
  });
  await mealSequences.save();

  res.json({ sequences });
};
export const editGradeMealTimes = async (req: Request, res: Response) => {
  interface GradeMealTimes {
    time: MealTimeType;
    classTimes: ClassType;
  }

  const gradeIdx = parseInt(req.params.grade) - 1;
  const { time, classTimes }: GradeMealTimes = req.body;

  const mealTimes = await MealOrderModel.findOne({ field: 'times' });
  if (!mealTimes) throw new HttpException(404, '급식 시간 데이터를 찾을 수 없습니다.');

  mealTimes[time].splice(gradeIdx, 1, classTimes);
  Object.assign(mealTimes, {
    ...mealTimes,
  });
  await mealTimes.save();

  res.json({ classTimes });
};

// 체크인 로그
export const getCheckInLog = async (req: Request, res: Response) => {
  const { targetGrade, targetClass, targetNumber } = req.params;

  const checkinlog = await CheckinLogModel.find({
    ...(targetGrade !== 'all' && { grade: parseInt(targetGrade) }),
    ...(targetClass !== 'all' && { class: parseInt(targetClass) }),
    ...(targetNumber !== 'all' && { number: parseInt(targetNumber) }),
  }).populate('student');

  res.json({ checkinlog });
};

// 경고
export const setWarning = async (req: Request, res: Response) => {
  const { sid, type, reason } = req.body;

  const date = getNowTimeString();

  const warning = await new WarningModel({
    student: new ObjectId(sid),
    type,
    reason,
    date,
  }).save();

  res.json({ warning });
};

// FCM
export const getDeviceTokens = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user._id).select('dalgeurakToken');
  res.json({ registeredTokens: user.dalgeurakToken });
};
export const registerDeviceToken = async (req: Request, res: Response) => {
  const { deviceToken } = req.body;
  const user = await UserModel.findById(req.user._id).select('dalgeurakToken');
  const tokenIndex = user.dalgeurakToken.indexOf(deviceToken);
  if (tokenIndex > -1) throw new HttpException(409, '해당 디바이스 토큰이 이미 서버에 등록되어 있습니다.');
  user.dalgeurakToken.push(deviceToken);
  await user.save();
  res.json({ registeredTokens: user.dalgeurakToken });
};
export const revokeDeviceToken = async (req: Request, res: Response) => {
  const { deviceToken } = req.body;
  const user = await UserModel.findById(req.user._id).select('dalgeurakToken');
  const tokenIndex = user.dalgeurakToken.indexOf(deviceToken);
  if (tokenIndex < 0) throw new HttpException(404, '해당 디바이스 토큰이 사용자 모델에 등록되어 있지 않습니다.');
  user.dalgeurakToken.splice(tokenIndex, 1);
  await user.save();
  res.json({ registeredTokens: user.dalgeurakToken });
};
