import { Request, Response } from 'express';
import { TimetableModel } from '../../models';
import { getWeekStart, getWeekEnd } from '../../resources/date';

const TEMP_DATE = '2020-06-30';

export const getWeeklyTimetable = async (req: Request, res: Response) => {
  const today = new Date(TEMP_DATE);
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);

  const { grade, class: klass } = {
    grade: parseInt(req.params.grade, 10),
    class: parseInt(req.params.class, 10),
  };

  const data = await TimetableModel.find({
    date: {
      $gte: weekStart,
      $lte: weekEnd,
    },
    grade,
    class: klass,
  });

  const timetable = Array.from(
    { length: 5 },
    (v, day) => {
      const dayClasseNames = data
        .filter((c) => c.date.getDay() === day + 1)
        .sort((a, b) => a.period - b.period)
        .map((c) => c.subject);
      return dayClasseNames;
    },
  );

  res.json({ timetable });
};
