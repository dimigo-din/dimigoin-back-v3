import { NextFunction, Request, Response } from 'express';
import { getConfig } from '../resources/config';
import { ConfigKeys } from '../types';
import { HttpException } from '../exceptions';

export const checkAfterschoolApplyPeriod = async (req: Request, res: Response, next: NextFunction) => {
  const applyPeriod = await getConfig(ConfigKeys.afterschoolApplyPeriod);
  const now = new Date();
  if (now < applyPeriod.start || applyPeriod.end < now) {
    throw new HttpException(403, '방과 후 수강 신청 기간이 아닙니다.');
  }
  next();
};
