import axios from 'axios';
import config from '../config';
import {
  getWeekStartString,
  getWeekEndString,
  getTomorrowDateString,
  getTodayDateString,
} from '../resources/date';
import { TimetableModel } from '../models';
import aliases from './subject-aliases.json';

const getAPIEndpoint = (grade: number, klass: number, date: string) => (
  'https://open.neis.go.kr/hub/hisTimetable?'
  + `KEY=${config.neisAPIKey}&`
  + 'Type=json&'
  + 'pSize=1000&'
  + 'pIndex=1&'
  + 'ATPT_OFCDC_SC_CODE=J10&'
  + 'SD_SCHUL_CODE=7530560&'
  + `GRADE=${grade}&`
  + `CLASS_NM=${klass}&`
  // Remove hyphen
  + `TI_FROM_YMD=${date.split('-').join('')}&`
  + `TI_TO_YMD=${date.split('-').join('')}`
);

export const fetchWeeklyTimetable = async () => {
  const today = getTodayDateString();
  const weekStart = getWeekStartString(today);
  const weekEnd = getWeekEndString(today);

  const timetable = [];
  for (let date = weekStart; date < weekEnd; date = getTomorrowDateString(date)) {
    for (let grade = 1; grade <= 3; grade += 1) {
      for (let klass = 1; klass <= 6; klass += 1) {
        const endpoint = getAPIEndpoint(grade, klass, date);

        // eslint-disable-next-line
        const { data } = await axios.get(endpoint);
        if ('hisTimetable' in data) {
          const { hisTimetable } = data;
          const { row: result } = hisTimetable[1];

          const dailyTimetable = {
            date,
            grade,
            class: klass,
            sequence: result
              .sort((a: any, b: any) => a.PERIO - b.PERIO)
              .map(
                (r: any) => {
                  const subject = r.ITRT_CNTNT.replace(/\[보강\]\*/i, '');
                  // @ts-ignore
                  if (subject in aliases) return aliases[subject];
                  return subject;
                },
              ),
          };

          timetable.push(dailyTimetable);
        }
      }
    }
  }
  return timetable;
};

export const refreshWeeklyTimetable = async () => {
  const today = getTodayDateString();
  const weeklyTimetable = await fetchWeeklyTimetable();

  await TimetableModel.deleteMany({
    date: {
      $gte: getWeekStartString(today),
      $lte: getWeekEndString(today),
    },
  });

  await TimetableModel.insertMany(weeklyTimetable);
};
