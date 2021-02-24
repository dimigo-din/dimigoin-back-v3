import { Request, Response } from 'express';
import { sendPushMessage } from '../../resources/push';
import { HttpException } from '../../exceptions';
import { NoticeModel } from '../../models';
import { getTodayDateString } from '../../resources/date';

export const getAllNotices = async (req: Request, res: Response) => {
  const notices = await NoticeModel.find({});

  res.json({ notices });
};

export const getNotice = async (req: Request, res: Response) => {
  const notice = await NoticeModel.findById(req.params.noticeId);

  res.json({ notice });
};

export const removeNotice = async (req: Request, res: Response) => {
  const notice = await NoticeModel.findById(req.params.noticeId);
  if (!notice) throw new HttpException(404, '해당 공지를 찾을 수 없습니다.');
  await notice.remove();
  res.json({ notice });
};

export const getCurrentNotices = async (req: Request, res: Response) => {
  const today = getTodayDateString();
  const { user } = req;
  const notices = await NoticeModel.find({
    ...(user.grade ? {
      targetGrade: { $all: [user.grade] },
    } : undefined),
    startDate: { $lte: today },
    endDate: { $gte: today },
  });

  res.json({ notices });
};

export const editNotice = async (req: Request, res: Response) => {
  const notice = await NoticeModel.findById(req.params.noticeId);
  if (!notice) throw new HttpException(404, '해당 공지사항을 찾을 수 없습니다.');

  Object.assign(notice, req.body);
  await notice.save();

  res.json({ notice });
};

export const createNotice = async (req: Request, res: Response) => {
  const notice = await new NoticeModel({
    ...(req.body),
    author: req.user._id,
  }).save();

  const today = getTodayDateString();
  if (today === notice.startDate) {
    await sendPushMessage(
      { grade: { $in: notice.targetGrade } },
      '새로운 공지사항이 등록되었어요!',
      `[${notice.title}]\n${notice.content}`,
    );
  }

  res.json({ notice });
};
