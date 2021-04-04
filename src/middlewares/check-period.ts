import { NextFunction, Request, Response } from 'express';
import moment from 'moment-timezone';
import { getConfig } from '../resources/config';
import { ConfigKeys } from '../types';
import { HttpException } from '../exceptions';
import { getMinutesValue } from '../resources/date';

export const checkAfterschoolApplyPeriod = async (req: Request, res: Response, next: NextFunction) => {
  const userGrade = req.user.grade;
  const applyPeriod = (await getConfig(ConfigKeys.afterschoolApplyPeriod))[userGrade - 1];

  const now = new Date();
  if (now < applyPeriod.start || applyPeriod.end < now) {
    throw new HttpException(400, '방과 후 수강 신청 기간이 아닙니다.');
  }
  next();
};

export const checkIngangApplyPeriod = async (req: Request, res: Response, next: NextFunction) => {
  const applyPeriod = await getConfig(ConfigKeys.ingangApplyPeriod);
  const applyStart = getMinutesValue(applyPeriod.start);
  const applyEnd = getMinutesValue(applyPeriod.end);
  const now = getMinutesValue({
    hour: moment().hour(),
    minute: moment().minute(),
  });
  if (now < applyStart || applyEnd < now) {
    throw new HttpException(400, '인강실 추가 신청 및 취소가 가능한 시간이 아닙니다.');
  }
  next();
};

export const checkMetoringApplyPeriod = async (req: Request, res: Response, next: NextFunction) => {
  const applyPeriod = await getConfig(ConfigKeys.mentoringApplyPeriod);
  const applyStart = getMinutesValue(applyPeriod.start);
  const applyEnd = getMinutesValue(applyPeriod.end);
  const now = getMinutesValue({
    hour: moment().hour(),
    minute: moment().minute(),
  });
  if (now < applyStart || applyEnd < now) {
    throw new HttpException(400, '멘토링 신청 및 취소가 가능한 시간이 아닙니다.');
  }
  next();
};
