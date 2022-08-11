import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  getMonthEndString,
  getMonthStartString,
  getTodayDateString,
  isValidDate,
} from '../../resources/date';
import io from '../../resources/socket';
import { HttpException } from '../../exceptions';
import { MealExceptionModel } from '../../models/dalgeurak';
import { ConfigKeys, MealExceptionValues } from '../../types';
import { DGLsendPushMessage } from '../../resources/dalgeurakPush';
import { UserModel } from '../../models';
import { getConfig } from '../../resources/config';

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

// 선후밥
// 선후밥
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
