import { Request, Response } from 'express';
import { TimetableModel } from '../../models';
import { getWeekStartString, getWeekEndString } from '../../resources/date';

const TEMP_DATE = '2020-11-15';

export const getWeeklyTimetable = async (req: Request, res: Response) => {
  const { grade, class: klass } = {
    grade: parseInt(req.params.grade),
    class: parseInt(req.params.class),
  };

  const timetable = await TimetableModel.find({
    date: {
      $gte: getWeekStartString(TEMP_DATE),
      $lte: getWeekEndString(TEMP_DATE),
    },
    grade,
    class: klass,
  });

  res.json({ timetable });
};
