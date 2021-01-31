import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import * as Notice from '../../models/notice';

export const getAllNotices = async (req: Request, res: Response) => {
  const notices = await Notice.model.find({});

  res.json({ notices });
};

export const getNotice = async (req: Request, res: Response) => {
  const notice = await Notice.model.findById(req.params.noticeId);

  res.json({ notice });
};

export const getCurrentNotices = async (req: Request, res: Response) => {
  const now = new Date();
  const { user } = req;
  const notices = await Notice.model.find({
    ...(user.grade ? {
      targetGrade: { $all: [user.grade] },
    } : undefined),
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  res.json({ notices });
};

export const editNotice = async (req: Request, res: Response) => {
  const notice = await Notice.model.findById(req.params.noticeId);
  if (!notice) throw new HttpException(404, '해당 공지사항을 찾을 수 없습니다.');

  Object.assign(notice, req.body);
  await notice.save();

  res.json({ notice });
};

export const createNotice = async (req: Request, res: Response) => {
  const notice = await new Notice.model(req.body).save();
  res.json({ notice });
};
