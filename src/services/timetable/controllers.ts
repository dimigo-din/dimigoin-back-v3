import { Request, Response } from 'express';
import { TimetableModel } from '../../models';
import { getWeekStart, getWeekEnd } from '../../resources/date';

const TEMP_DATE = '2020-11-15';

export const getWeeklyTimetable = async (req: Request, res: Response) => {
  const today = new Date(TEMP_DATE);
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);

  const { grade, class: klass } = {
    grade: parseInt(req.params.grade, 10),
    class: parseInt(req.params.class, 10),
  };

  const timetable = await TimetableModel.find({
    date: {
      $gte: weekStart,
      $lte: weekEnd,
    },
    grade,
    class: klass,
  });

  res.json({ timetable });
};
