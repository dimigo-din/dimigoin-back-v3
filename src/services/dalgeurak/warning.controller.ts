import { Request, Response } from 'express';
import { WarningModel } from '../../models/dalgeurak';
import { getNowTimeString } from '../../resources/date';

export const createWarning = async (req: Request, res: Response) => {
  const { sid, type, reason } = req.body;

  const date = getNowTimeString();

  const warning = await new WarningModel({
    student: +sid,
    type,
    reason,
    date,
  }).save();

  res.json({ warning });
};

export const getWarning = async (req: Request, res: Response) => {
  const warning = await WarningModel.find({
    student: req.user.user_id,
  });

  res.json({ warning });
};

export const getStudentWarning = async (req: Request, res: Response) => {
  const { sid } = req.params;

  const warning = await WarningModel.find({
    student: +sid,
  });

  res.json({ warning });
};
