import { Request, Response } from 'express';
import { HttpException } from '../../exceptions';
import { getTodayDateString, isValidDate } from '../../resources/date';
import { AttendanceLogModel, UserModel } from '../../models';

export const getClassStatus = async (req: Request, res: Response) => {
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

  const studentsInClass = await UserModel
    .find({ grade, class: klass });

  const studentsWithLog = await Promise.all(
    studentsInClass.map(async (student) => {
      const log = await AttendanceLogModel.findOne({
        date,
        student: student._id,
      })
        .populateTs('student')
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
    .populateTs('student')
    .populateTs('place')
    .populateTs('updatedBy')
    .sort('-createdAt'))
    .filter(({ student }) => (
      student.grade === grade
      && student.class === klass
    ));

  res.json({ logs });
};

export const getStudentAttendanceHistory = async (req: Request, res: Response) => {
  const { date } = req.params;
  if (!isValidDate(date)) throw new HttpException(400, '유효하지 않은 날짜입니다.');

  const student = await UserModel.findOne({
    _id: req.params.studentId,
    userType: 'S',
  });
  if (!student) throw new HttpException(404, '해당 학생을 찾을 수 없습니다.');

  const logs = await AttendanceLogModel.find({
    date: req.params.date,
    student: student._id,
  })
    .populateTs('place')
    .populateTs('student')
    .populateTs('updatedBy');
  res.json({ logs });
};

export const createAttendanceLog = async (req: Request, res: Response) => {
  const payload = req.body;
  const { _id: student } = req.user;

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
    updatedBy: req.user._id,
  });

  await attendanceLog.save();
  res.json({ attendanceLog });
};

export const getMyAttendanceLogs = async (req: Request, res: Response) => {
  const logs = (await AttendanceLogModel
    .find({
      date: getTodayDateString(),
      student: req.user._id,
    })
    .populateTs('student')
    .populateTs('place')
    .populateTs('updatedBy')
    .sort('-createdAt'));

  res.json({ logs });
};
