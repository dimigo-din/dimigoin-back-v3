import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { getDayStart, getOnlyDate } from '../../resources/date';
import { AttendanceLogModel } from '../../models';

export const getClassStatus = async (req: Request, res: Response) => {
  const { grade, class: klass, userType } = req.user;
  if (userType !== 'T' && (
    grade !== parseInt(req.params.grade, 10)
      || klass !== parseInt(req.params.class, 10)
  )) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  const date = getOnlyDate(new Date());
  const logs = (await AttendanceLogModel
    .find({ date })
    .populateTs('student')
    .populateTs('place'))
    .filter(({ student }) => (
      student.grade === grade
      && student.class === klass
    ));

  res.json({ logs });
};

export const createAttendanceLog = async (req: Request, res: Response) => {
  const payload = req.body;
  const { _id: student } = req.user;

  const date = getOnlyDate(new Date());

  const attendanceLog = new AttendanceLogModel({
    student,
    date,
    ...payload,
  });

  await attendanceLog.save();

  const populatedLog = await AttendanceLogModel
    .findById(attendanceLog._id)
    .populateTs('place')
    .populateTs('student');

  res.json({ attendanceLog: populatedLog });
};

export const getMyAttendanceLogs = async (req: Request, res: Response) => {
  const { grade, class: klass } = req.user;
  const logs = (await AttendanceLogModel
    .find({ date: { $gte: getDayStart(new Date()) } })
    .populateTs('student')
    .populateTs('place')
    .sort('-createdAt'))
    .filter(({ student }) => (
      student.grade === grade
      && student.class === klass
    ));

  res.json({ logs });
};
