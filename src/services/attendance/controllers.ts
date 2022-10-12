import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { getTodayDateString, isValidDate } from '../../resources/date';
import { AttendanceLogModel } from '../../models';
import { getStudentInfo, studentSearch } from '../../resources/dimi-api';

export const getClassStatus = async (req: Request, res: Response) => {
  if (!(['T', 'D'].includes(req.user.userType)) && (
    req.user.grade !== parseInt(req.params.grade)
    || req.user.class !== parseInt(req.params.class)
  )) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  const { date } = req.params;
  if (!isValidDate(date)) throw new HttpException(400, '유효하지 않은 날짜입니다.');
  const grade = parseInt(req.params.grade);
  const klass = parseInt(req.params.class);

  const studentsInClass = await studentSearch({
    grade,
    class: klass,
  });

  const studentsWithLog = await Promise.all(
    studentsInClass.map(async (student) => {
      const log = await AttendanceLogModel.findOne({
        date,
        student: student.user_id,
      })
        .populateTs('place')
        .populateTs('updatedBy')
        .sort('-createdAt');

      return {
        student,
        log,
      };
    }),
  );
  res.json({ status: studentsWithLog });
};

export const getClassTimeline = async (req: Request, res: Response) => {
  if (req.user.userType !== 'T' && (
    req.user.grade !== parseInt(req.params.grade)
    || req.user.class !== parseInt(req.params.class)
  )) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  const { date } = req.params;
  if (!isValidDate(date)) throw new HttpException(400, '유효하지 않은 날짜입니다.');
  const grade = parseInt(req.params.grade);
  const klass = parseInt(req.params.class);

  const logs = (await AttendanceLogModel.find({ date })
    .populateTs('place')
    .populateTs('updatedBy')
    .sort('-createdAt'))
    .filter(async ({ student }) => {
      const std = await getStudentInfo(student);
      return (
        std.grade === grade
        && std.class === klass
      );
    });

  res.json({ logs });
};

export const getStudentAttendanceHistory = async (req: Request, res: Response) => {
  const { date } = req.params;
  if (!isValidDate(date)) throw new HttpException(400, '유효하지 않은 날짜입니다.');

  const student = await getStudentInfo(req.params.studentId as unknown as number);
  if (!student) throw new HttpException(404, '해당 학생을 찾을 수 없습니다.');

  const logs = await AttendanceLogModel.find({
    date: req.params.date,
    student: student.user_id,
  })
    .populateTs('place')
    .populateTs('updatedBy')
    .sort('-createdAt');
  logs.forEach(async (e, idx) => {
    (logs[idx].student as any) = await getStudentInfo(e.student);
  });
  res.json({ logs });
};

export const createAttendanceLog = async (req: Request, res: Response) => {
  const payload = req.body;
  const { user_id: student } = req.user;

  const today = getTodayDateString();

  const attendanceLog = new AttendanceLogModel({
    student,
    date: today,
    ...payload,
  });

  await attendanceLog.save();
  res.json({ attendanceLog });
};

export const createAttendanceLogByManager = async (req: Request, res: Response) => {
  const payload = req.body;
  const student = req.params.studentId;

  const today = getTodayDateString();

  const attendanceLog = new AttendanceLogModel({
    student,
    date: today,
    ...payload,
    updatedBy: req.user.user_id,
  });

  await attendanceLog.save();
  res.json({ attendanceLog });
};

export const getMyAttendanceLogs = async (req: Request, res: Response) => {
  const logs = (await AttendanceLogModel
    .find({
      date: getTodayDateString(),
      student: req.user.user_id,
    })
    .populateTs('place')
    .populateTs('updatedBy')
    .sort('-createdAt'));

  logs.forEach(async (e, idx) => {
    (logs[idx].student as any) = await getStudentInfo(e.student);
  });
  res.json({ logs });
};
