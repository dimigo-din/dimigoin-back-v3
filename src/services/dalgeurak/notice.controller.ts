import { Request, Response } from 'express';
import { NoticeModel } from '../../models/dalgeurak';

export const createNotice = async (req: Request, res: Response) => {
  const { message } = req.body;

  await new NoticeModel({
    message,
  }).save();

  res.json({ success: true });
};

export const getNotice = async (req: Request, res: Response) => {
  const notice = await NoticeModel.findOne().sort({ _id: -1 });

  res.json({ notice });
};

export const deleteNotice = async (req: Request, res: Response) => {
  const { _id } = req.body;

  await NoticeModel.deleteOne({ _id });

  res.json({ success: true });
};
