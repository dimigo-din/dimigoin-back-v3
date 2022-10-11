import { Request, Response } from 'express';
import { isValidDate } from '../../resources/date';
import { MealCancelModel } from '../../models/dalgeurak';
import { HttpException } from '../../exceptions';
import {
  getStudentInfo,
  getTeacherInfo,
  teacherSearch,
} from '../../resources/dimi-api';
import { aramark } from '../../types';
import { DGRsendPushMessage } from '../../resources/dalgeurakPush';
import { UserTypeModel } from '../../models';

export const createMealCancel = async (req: Request, res: Response) => {
  const {
    reason,
    startDate,
    endDate,
    time,
  } = req.body;
  const { user_id: applier } = req.user;

  if (!isValidDate(startDate) && !isValidDate(endDate)) {
    throw new HttpException(401, '날짜 형태가 올바르지 않습니다.');
  }

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
    { grade: req.user.grade, class: req.user.class },
    '급식 취소 신청 (담임)',
    `${req.user.name} 학생이 급식 취소를 신청하였습니다.\n담임 선생님의 1차 승인 대기 중입니다.`,
    true,
  );

  res.json({ data });
};

export const getMealCancel = async (req: Request, res: Response) => {
  const { username } = req.user;
  const { type } = await UserTypeModel.findOne({ userId: req.user.user_id });

  if (username === aramark) {
    const students = await MealCancelModel.find({
      applicationStatus: 'aramarkWaiting',
    });

    res.json({ students });
  } else if (type === 'T') {
    const gc = (await teacherSearch({ user_id: req.user.user_id }))[0];
    if (!gc) throw new HttpException(401, '권한이 없습니다.');

    const applications = await MealCancelModel.find({
      applicationStatus: 'teacherWaiting',
    });

    const students = applications.filter(async (e) => {
      const student = await getStudentInfo(e.applier);
      return student.grade === gc.grade && student.class === gc.class;
    });

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
      { user_id: application.applier },
      '급식 취소 신청 안내',
      `급식 취소 신청이 ${approve ? '승인' : '반려'}되었습니다.`,
    );

    res.json({ data: application });
  } else if (req.user.userType === 'T') {
    const gc = await getTeacherInfo(req.user.user_id);
    if (!gc) throw new HttpException(401, '권한이 없습니다.');

    const student = await getStudentInfo(application.applier);
    if (student.grade !== gc.grade && student.class !== gc.class) { throw new HttpException(401, '권한이 없습니다.'); }

    Object.assign(application, {
      applicationStatus: approve ? 'aramarkWaiting' : 'reject',
    });
    await application.save();

    await DGRsendPushMessage(
      { user_id: application.applier },
      '급식 취소 신청 안내',
      `급식 취소 신청이 1차(담임선생님) ${
        approve ? '승인' : '반려'
      }되었습니다.${approve ? '\n2차(급식실) 승인 대기 중입니다.' : ''}`,
    );
    if (approve) {
      await DGRsendPushMessage(
        { username: aramark },
        '급식 취소 신청 (급식실)',
        `${student.grade}학년 ${student.class}반 ${student.name}학생의 급식 취소 신청이 1차(담임선생님) 승인되었습니다.\n급식실의 최종 승인 대기 중입니다.`,
        true,
      );
    }

    res.json({ data: application });
  } else throw new HttpException(401, '권한이 부족합니다.');
};

export const createStudentMealCancel = async (req: Request, res: Response) => {
  const {
    id, reason, startDate, endDate, time,
  } = req.body;
  const { user_id: applier } = req.user;

  const teacher = await getStudentInfo(applier);

  if (!isValidDate(startDate) && !isValidDate(endDate)) {
    throw new HttpException(401, '날짜 형태가 올바르지 않습니다.');
  }

  // eslint-disable-next-line prefer-const
  for (let student of id) {
    const applicationCheck = await MealCancelModel.findOne({
      'duration.start': startDate,
      'duration.end': endDate,
      applier: student,
    });
    // eslint-disable-next-line no-continue
    if (applicationCheck) continue;

    await new MealCancelModel({
      applier: student,
      reason,
      time,
      duration: {
        start: startDate,
        end: endDate,
      },
    }).save();

    const std = await getStudentInfo(student);

    await DGRsendPushMessage(
      { user_id: student },
      '급식 취소 신청',
      `${teacher.name} 선생님께서 ${std.name}님의 급식 취소 신청을 하였습니다.\n2차(급식실) 승인 대기 중입니다.`,
    );
  }

  await DGRsendPushMessage(
    { username: aramark },
    '급식 취소 신청 (급식실)',
    `${teacher.name} 선생님께서 총 ${id.length}명의 학생을 급식 취소 신청하였습니다.\n급식실의 최종 승인 대기 중입니다.`,
    true,
  );

  res.json({ id });
};
