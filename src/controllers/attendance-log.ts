import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { getOnlyDate } from '../resources/date';
import { AttendanceLogModel, UserModel } from '../models';
import { getUserIdentity } from '../resources/user';

export const getClassStatus = async (req: Request, res: Response) => {
  const { grade, class: klass, userType } = await getUserIdentity(req);
  if (
    userType !== 'T' && (
      grade !== parseInt(req.body.grade, 10)
      || klass !== parseInt(req.body.class, 10)
    )
  ) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  const date = new Date(req.body.date);
  // Todo: Populate로 리팩토링 해야 함
  const logsInClass = (await AttendanceLogModel
    .find({})
    .populateTs('student')
    .populateTs('place'))
    .filter((log) => (
      log.student.grade === grade
      && log.student.class === klass
      && log.date.getTime() === date.getTime()
    ));

  const studentsInClass = await UserModel.find({
    grade,
    class: klass,
  });

  const reducedLogs = studentsInClass.reduce((acc: any, curr: any) => {
    const student = `${curr.serial} ${curr.name}`;
    // @ts-ignore
    acc[student] = logsInClass.filter((log) => log.student.serial === curr.serial);
    return acc;
  }, {});

  res.json({ classLogs: reducedLogs });
};

export const createAttendanceLog = async (req: Request, res: Response) => {
  const payload = req.body;
  const {
    _id: student,
  } = await getUserIdentity(req);
  const currentTime = (
    new Date().getHours() * 100
    + new Date().getMinutes()
  );
  if (currentTime < 1940 || currentTime > 2250) {
    throw new HttpException(403, '출입 인증을 할 수 없는 시간입니다.');
  }
  const date = getOnlyDate(new Date());
  const time = currentTime < 2110 ? 1 : 2;
  if (await AttendanceLogModel.checkDuplicatedLog(
    student,
    date,
    time,
  )) {
    throw new HttpException(409, '이미 출입 인증을 했습니다.');
  }

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
