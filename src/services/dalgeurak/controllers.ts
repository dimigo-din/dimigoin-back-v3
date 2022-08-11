import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import Jwt from 'jsonwebtoken';
import { HttpException } from '../../exceptions';
import config from '../../config';
import {
  CheckinLogModel,
  MealExceptionModel,
  MealOrderModel,
  WarningModel,
} from '../../models/dalgeurak';
import { UserModel } from '../../models';
import {
  ClassType,
  ConfigKeys,
  MealExceptionValues,
  MealTardyStatusType,
  MealTimeType,
} from '../../types';
import {
  getExtraTime,
  getMonthEndString,
  getMonthStartString,
  getNowTimeString,
  getTodayDateString,
  isValidDate,
} from '../../resources/date';
import { checkTardy, getOrder, setConvenienceFood } from '../../resources/dalgeurak';
import { DGLsendPushMessage } from '../../resources/dalgeurakPush';
import io from '../../resources/socket';
import { getConfig } from '../../resources/config';

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

const getMonthlyUsedTicket = async (applier: ObjectId) => await MealExceptionModel.countDocuments({
  applier,
  date: {
    $gte: getMonthStartString(),
    $lte: getMonthEndString(),
  },
});
const getTodayUsedTickets = async () => await MealExceptionModel.countDocuments({
  date: getTodayDateString(),
});

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
  io.of('/dalgeurak').to('mealStatus').emit('mealStatus', {
    _id: req.user._id,
    mealStatus,
  });
};

// 현재 급식 받고 있는 반
export const getNowSequence = async (req: Request, res: Response) => {
  const mealSequences = await MealOrderModel.findOne({ field: 'sequences' });
  if (!mealSequences) throw new HttpException(404, '급식 순서 데이터를 찾을 수 없습니다.');

  const { gradeIdx, classIdx, now } = await getOrder();

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

  const { gradeIdx, classIdx, now } = await getOrder();

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

  const extraLunch = mealTimes.lunch.map((grade: number[]) => grade.map((time: number) => getExtraTime(extraMinute, time)));
  const extraDinner = mealTimes.dinner.map((grade: number[]) => grade.map((time: number) => getExtraTime(extraMinute, time)));

  res.json({
    extraLunch,
    extraDinner,
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
  const { reason, date, time } = req.body;
  const { _id: applier } = req.user;
  if (!MealExceptionValues.includes(type)) throw new HttpException(401, 'type parameter 종류는 first 또는 last 이어야 합니다.');
  if (!isValidDate(date)) throw new HttpException(401, '날짜는 YYYY-MM-DD 형식이어야 합니다.');

  const exceptionStatus = await MealExceptionModel.findOne({ applier });
  if (exceptionStatus) throw new HttpException(401, '이미 등록되어 있습니다.');

  const exception = await new MealExceptionModel({
    exceptionType: type,
    applier,
    reason,
    time,
    date: getTodayDateString(),
  }).save();

  res.json({ exception });
};
// 선밥권
export const useFirstMealTicket = async (req: Request, res: Response) => {
  const { _id: applier } = req.user;
  const { time } = req.body;

  const maxApplicationCount = await getConfig(ConfigKeys.firstMealMaxApplicationPerMeal);
  const todayUsedTickets = await getTodayUsedTickets();

  const monthlyTicketCount = await getConfig(ConfigKeys.monthlyFirstMealTicketCount);
  const monthlyUsedTicket = await getMonthlyUsedTicket(applier);

  if (todayUsedTickets >= maxApplicationCount) throw new HttpException(401, '신청 인원을 초과했습니다.');
  if (monthlyUsedTicket >= monthlyTicketCount) throw new HttpException(401, '이번 달 선밥권 티켓을 모두 사용했습니다.');

  const todayUsedTicket = await MealExceptionModel.findOne({
    applier,
    date: getTodayDateString(),
  });

  if (todayUsedTicket.time === time) throw new HttpException(401, '이미 해당 급식에 선밥권을 사용했습니다.');

  await new MealExceptionModel({
    applier,
    exceptionType: 'first',
    reason: '선밥권',
    applicationStatus: 'permitted',
    ticket: true,
    time,
    date: getTodayDateString(),
  }).save();

  res.json({ ticket: monthlyTicketCount - (monthlyUsedTicket + 1) });
};
export const cancelMealException = async (req: Request, res: Response) => {
  const { _id } = req.user;
  const exception = await MealExceptionModel.findOne({ applier: _id });
  if (!exception) throw new HttpException(404, '선/후밥 신청 데이터를 찾을 수 없습니다.');

  await exception.deleteOne();
  res.json({ exception });
};
export const permissionMealException = async (req: Request, res: Response) => {
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
  if (permission === 'permitted') {
    io.of('/dalgeurak').to('mealStatus').emit('mealStatus', {
      _id: sid,
      mealStatus: 'certified',
    });
  }
};
export const giveMealException = async (req: Request, res: Response) => {
  const { type, sid, reason } = req.body;

  const teacher = await UserModel.findById(req.user._id);

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
  io.of('/dalgeurak').to('mealStatus').emit('mealStatus', {
    _id: sid,
    mealStatus: 'certified',
  });
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

// 간편식
export const createConvenience = async (req: Request, res: Response) => {
  await setConvenienceFood();
  res.json({});
};

// 디넌용
// 입장처리
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
  await DGLsendPushMessage(
    { _id: req.user._id },
    title,
    message,
  );

  res.json({ title, message });
};
