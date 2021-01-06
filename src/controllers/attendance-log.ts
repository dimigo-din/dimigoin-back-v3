import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { getOnlyDate, getTime } from '../resources/date';
import { AttendanceLogModel, UserModel } from '../models';
import { getUserIdentity } from '../resources/user';
import { IUser } from '../interfaces';

export const getClassStatus = async (req: Request, res: Response) => {
  const { grade, class: klass, userType } = await getUserIdentity(req);
  if (userType !== 'T' && (
    grade !== parseInt(req.params.grade, 10)
      || klass !== parseInt(req.params.class, 10)
  )) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  const date = getOnlyDate(new Date());
  const logsInClass = (await AttendanceLogModel
    .find({ date })
    .populateTs('student')
    .populateTs('place'))
    .filter(({ student }) => (
      student.grade === grade
      && student.class === klass
    ));

  const studentsInClass = await UserModel.find({
    grade,
    class: klass,
  });

  const reducedLogs = studentsInClass.reduce(
    (reduced: any, student: IUser) => {
      const studentCode = `${student.serial} ${student.name}`;
      reduced[studentCode] = logsInClass.filter(
        (log) => log.student.serial === student.serial,
      );
      return reduced;
    },
    {},
  );

  res.json({ classLogs: reducedLogs });
};

export const createAttendanceLog = async (req: Request, res: Response) => {
  const payload = req.body;
  const { _id: student } = await getUserIdentity(req);

  const date = getOnlyDate(new Date());
  const time = getTime(new Date());
  if (!time) throw new HttpException(423, '출입 인증을 할 수 없는 시간입니다.');

  const attendanceLog = new AttendanceLogModel({
    student,
    time,
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

export const myAttendanceStatus = async (req: Request, res: Response) => {
  const { grade, class: klass } = await getUserIdentity(req);
  const date = getOnlyDate(new Date());
  const myLogs = (await AttendanceLogModel
    .find({ date })
    .populateTs('student')
    .populateTs('place'))
    .filter(({ student }) => (
      student.grade === grade
      && student.class === klass
    ))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.json({ myLogs });
};
