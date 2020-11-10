import { Request, Response } from 'express';
import { HttpException } from '../exceptions';
import { AttendanceLogModel, UserModel } from '../models';
import { getUserIdentity } from '../resources/user';

export const getClassStatus = async (req: Request, res: Response) => {
  const { grade, class: klass, userType } = await getUserIdentity(req);
  if (
    userType !== 'T' && (
      grade !== parseInt(req.params.grade, 10)
      || klass !== parseInt(req.params.class, 10)
    )
  ) {
    throw new HttpException(403, '권한이 없습니다.');
  }

  const date = new Date(req.params.date);
  const logsInClass = await AttendanceLogModel
    .find({})
    .populate('student')
    .find({
      'student.grade': grade,
      'student.class': klass,
      date,
    })
    .exec();

  const studentsInClass = await UserModel.find({
    grade,
    class: klass,
  });

  const reducedLogs = studentsInClass.reduce((acc: any, curr: any) => {
    const student: string = `${curr.serial} ${curr.name}`;
    // @ts-ignore
    acc[student] = logsInClass.find((log) => log.student._id === curr._id);
    return acc;
  }, {});

  res.json({ logs: reducedLogs });
};
