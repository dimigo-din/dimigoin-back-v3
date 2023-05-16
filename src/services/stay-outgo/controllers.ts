import { Request, Response } from 'express';
import moment from 'moment-timezone';
import { StayModel, StayOutgoModel } from '../../models';
import { HttpException } from '../../exceptions';

const timezone = 'Asia/Seoul';
moment.tz.setDefault(timezone);

export const getAllStayOutgo = async (req: Request, res: Response) => {
  const stayOutgo = await StayOutgoModel.find({});

  res.json({ stayOutgo });
};

export const getCurrentStayOutgo = async (req: Request, res: Response) => {
  const stay = await StayModel.findOne({ disabled: false, deleted: false });
  const stayOutgo = await StayOutgoModel.find({ stay: stay._id });

  res.json({ stayOutgo });
};

export const getStayOutgoById = async (req: Request, res: Response) => {
  const stayOutgo = await StayOutgoModel.findById(req.params.stayOutgoId);
  if (!stayOutgo) throw new HttpException(404, '잔류외출이 존재하지 않습니다.');

  res.json({ stayOutgo });
};

export const getMyStayOutgo = async (req: Request, res: Response) => {
  const stay = await StayModel.findOne({ disabled: false, deleted: false });
  const stayOutgo = await StayOutgoModel.find({ stay: stay._id, user: req.user.user_id });

  if (stayOutgo.length === 0) throw new HttpException(404, '신청한 잔류 외출이 없습니다.');

  res.json({ stayOutgo });
};

export const applyStayOutgo = async (req: Request, res: Response) => {
  const stay = await StayModel.findOne({ disabled: false, deleted: false });
  const { user } = req;

  const start = moment(req.body.duration.start);
  const end = moment(req.body.duration.end);
  const startYMD = start.format('YYYY/MM/DD');
  const endYMD = end.format('YYYY/MM/DD');
  const now = moment().startOf('day');
  const nowSat = now.clone().isoWeekday(6);
  const nowSatStart = nowSat.clone().endOf('day');
  const nowSun = now.clone().isoWeekday(7);
  const nowSunEnd = nowSun.clone().endOf('day');

  const isStartNotValid = (
    !start.isBetween(nowSat, nowSatStart)
    && !start.isBetween(nowSun, nowSunEnd)
  );
  const isPeriodNotValid = (startYMD !== endYMD);
  const isOrderNotValid = !start.isBefore(end);

  if (isStartNotValid || isPeriodNotValid || isOrderNotValid) {
    throw new HttpException(400, '올바른 잔류 외출 신청이 아닙니다.');
  }

  const stayOutgoApply = await StayOutgoModel.create({
    ...req.body,
    status: 'W',
    user: user.user_id,
    stay: stay._id,
    date: start.startOf('day').toISOString(),
  });
  res.json({ stayOutgoApply });
};

export const manageStayOutgo = async (req: Request, res: Response) => {
  const stayOutgo = await StayOutgoModel.findById(req.params.stayOutgoId);
  if (!stayOutgo) throw new HttpException(404, '해당 외출 정보를 찾을 수 없습니다.');

  stayOutgo.status = req.body.status;
  await stayOutgo.save();

  res.json({ stayOutgo });
};
