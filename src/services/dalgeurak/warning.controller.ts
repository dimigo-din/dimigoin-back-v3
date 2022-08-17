import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { WarningModel } from '../../models/dalgeurak';
import { getNowTimeString } from '../../resources/date';

export const createWarning = async (req: Request, res: Response) => {
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

export const getWarning = async (req: Request, res: Response) => {
  const warning = await WarningModel.findOne({
    student: new ObjectId(req.user._id),
  });

  res.json({ warning });
};
