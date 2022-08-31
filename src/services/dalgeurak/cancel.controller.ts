import { Request, Response } from 'express';
import { isValidDate } from '../../resources/date';
import { MealCancelModel } from '../../models/dalgeurak';
import { HttpException } from '../../exceptions';
import { popUser } from '../../resources/dalgeurak';
import { UserModel } from '../../models';
import { teacherRoleParse } from '../../resources/dimi-api';
import { User } from '../../interfaces';
import { aramark } from '../../types';
import { DGRsendPushMessage } from '../../resources/dalgeurakPush';

export const createMealCancel = async (req: Request, res: Response) => {
  const {
    reason, startDate, endDate, time,
  } = req.body;
  const { _id: applier } = req.user;

  if (!isValidDate(startDate) && !isValidDate(endDate)) { throw new HttpException(401, '날짜 형태가 올바르지 않습니다.'); }

  const applicationCheck = await MealCancelModel.findOne({
    'duration.start': startDate,
    'duration.end': endDate,
    applier,
  });
  if (applicationCheck) throw new HttpException(401, '이미 신청하였습니다.');

  const data = await new MealCancelModel({
    applier,
    reason,
    time,
    duration: {
      start: startDate,
      end: endDate,
    },
  }).save();

  await DGRsendPushMessage(
    { role: `${req.user.grade}학년 ${req.user.class}반 담임` },
    '급식 취소 신청 (담임)',
    `${req.user.name} 학생이 급식 취소를 신청하였습니다.`,
  );

  res.json({ data });
};

export const getMealCancel = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user._id);

  if (user.username === aramark) {
    const students = await MealCancelModel.find({
      applicationStatus: 'waiting2',
    });

    res.json({ students });
  } else if (user.userType === 'T') {
    const gc = teacherRoleParse(user.role);
    if (!gc) throw new HttpException(401, '권한이 없습니다.');

    const applications = await MealCancelModel.find({
      applicationStatus: 'waiting1',
    }).populate(popUser('applier'));

    const students = applications.filter((e) =>
      (e.applier as unknown as User).grade === gc.grade && (e.applier as unknown as User).class === gc.class);

    res.json({ students });
  } else throw new HttpException(401, '권한이 없습니다.');
};

export const applicationMealCancel = async (req: Request, res: Response) => {
  const { id, approve } = req.body;

  const application = await MealCancelModel.findOne({ _id: id });

  if (req.user.username === aramark) {
    Object.assign(application, {
      applicationStatus: approve ? 'approve' : 'reject',
    });
    await application.save();

    await DGRsendPushMessage(
      { _id: application.applier },
      '급식 취소 신청 안내',
      `급식 취소 신청이 ${approve ? '승인' : '반려'}되었습니다.`,
    );

    res.json({ data: application });
  } else if (req.user.userType === 'T') {
    Object.assign(application, {
      applicationStatus: approve ? 'waiting2' : 'reject',
    });
    await application.save();

    await DGRsendPushMessage(
      { _id: application.applier },
      '급식 취소 신청 안내',
      `급식 취소 신청이 1차 ${approve ? '승인' : '반려'}되었습니다.${approve ? '\n2차 승인 대기 중입니다.' : ''}`,
    );
    if (approve) {
      const student = await UserModel.findById(application.applier);

      await DGRsendPushMessage(
        { username: aramark },
        '급식 취소 신청 (급식실)',
        `${student.grade}학년 ${student.class}반 ${student.name}학생의 급식 취소 신청이 1차 승인되었습니다.\n급식실의 최송 승인 대기 중입니다.`,
      );
    }

    res.json({ data: application });
  } else throw new HttpException(401, '권한이 부족합니다.');
};
