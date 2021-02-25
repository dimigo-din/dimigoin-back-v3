import { Request, Response } from 'express';
import { TimetableModel } from '../../models';
import { getWeekStartString, getWeekEndString, getTodayDateString } from '../../resources/date';

export const getWeeklyTimetable = async (req: Request, res: Response) => {
  const { grade, class: klass } = {
    grade: parseInt(req.params.grade),
    class: parseInt(req.params.class),
  };
  const today = getTodayDateString();

  const timetable = await TimetableModel.find({
    date: {
      $gte: getWeekStartString(today),
      $lte: getWeekEndString(today),
    },
    grade,
    class: klass,
  });

  res.json({ timetable });
};
