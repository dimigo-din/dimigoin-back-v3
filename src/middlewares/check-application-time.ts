import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions';
import { getNowTime } from '../resources/date';

export const checkApplicationTime = async (req: Request, res: Response, next: NextFunction) => {
  const { time } = req.body;
  const nowTime = getNowTime();

  if (
    nowTime < 830
    || ((nowTime > 1150 && nowTime < 1350) && time === 'lunch')
    || nowTime > 1835
  ) throw new HttpException(401, '선밥 신청시간이 아닙니다.');

  next();
};
