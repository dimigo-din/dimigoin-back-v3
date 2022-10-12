import { Request, Response } from 'express';
import { sendPushMessage } from '../../resources/push';
import { HttpException } from '../../exceptions';
import { NoticeModel, UserTypeModel } from '../../models';
import { getTodayDateString } from '../../resources/date';
import { getStudentInfo, getTeacherInfo } from '../../resources/dimi-api';

export const getAllNotices = async (req: Request, res: Response) => {
  const notices = await NoticeModel.find({});

  notices.forEach(async (e, idx) => {
    const { type } = await UserTypeModel.findOne({ userId: e.author });
    if ('TD'.includes(type)) {
      (notices[idx].author as any) = await getTeacherInfo(e.author);
    } else {
      (notices[idx].author as any) = await getStudentInfo(e.author);
    }
  });

  res.json({ notices });
};

export const getNotice = async (req: Request, res: Response) => {
  const notice = await NoticeModel.findById(
    req.params.noticeId,
  );

  const { type } = await UserTypeModel.findOne({ userId: notice.author });
  if ('TD'.includes(type)) {
    (notice.author as any) = await getTeacherInfo(notice.author);
  } else {
    (notice.author as any) = await getStudentInfo(notice.author);
  }

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

  notices.forEach(async (e, idx) => {
    const { type } = await UserTypeModel.findOne({ userId: e.author });
    if ('TD'.includes(type)) {
      (notices[idx].author as any) = await getTeacherInfo(e.author);
    } else {
      (notices[idx].author as any) = await getStudentInfo(e.author);
    }
  });

  res.json({ notices });
};

export const editNotice = async (req: Request, res: Response) => {
  const notice = await NoticeModel.findById(
    req.params.noticeId,
  );
  if (!notice) throw new HttpException(404, '해당 공지사항을 찾을 수 없습니다.');

  const { type } = await UserTypeModel.findOne({ userId: notice.author });
  if ('TD'.includes(type)) {
    (notice.author as any) = await getTeacherInfo(notice.author);
  } else {
    (notice.author as any) = await getStudentInfo(notice.author);
  }

  Object.assign(notice, req.body);
  await notice.save();

  res.json({ notice });
};

export const createNotice = async (req: Request, res: Response) => {
  const notice = await new NoticeModel({
    ...(req.body),
    author: req.user.user_id,
  }).save();

  const today = getTodayDateString();
  if (today === notice.startDate) {
    await sendPushMessage(
      { grade: notice.targetGrade },
      '새로운 공지사항이 등록되었어요!',
      `[${notice.title}]\n${notice.content}`,
    );
  }

  res.json({ notice });
};
