import axios from 'axios';
import {
  getYYYYMMDD,
  getWeekStart,
  getWeekEnd,
  getTomorrow,
} from '../resources/date';
import { TimetableModel } from '../models';

const TEMP_DATE = '2020-06-30';

const getAPIEndpoint = (grade: number, klass: number, date: Date) => (
  'https://open.neis.go.kr/hub/hisTimetable?'
  + 'Type=json&'
  + 'KEY=a20bb8deb5b74e62869d828c790e0dc9&'
  + 'ATPT_OFCDC_SC_CODE=J10&'
  + 'SD_SCHUL_CODE=7530560&'
  + `GRADE=${grade}&`
  + `CLASS_NM=${klass}&`
  + `TI_FROM_YMD=${getYYYYMMDD(date)}&`
  + `TI_TO_YMD=${getYYYYMMDD(getTomorrow(date))}`
);

export const fetchWeeklyTimetable = async () => {
  const today = new Date(TEMP_DATE);
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);

  const timetable = [];
  for (let date = weekStart; date < weekEnd; date = getTomorrow(date)) {
    for (let grade = 1; grade <= 3; grade += 1) {
      for (let klass = 1; klass <= 6; klass += 1) {
        const endpoint = getAPIEndpoint(grade, klass, date);
        // eslint-disable-next-line
        const { data } = await axios.get(endpoint);
        if ('hisTimetable' in data) {
          const { hisTimetable } = data;
          const { row: result } = hisTimetable[1];
          const weeklyData = result.map((r: any) => ({
            date,
            grade,
            class: klass,
            subject: r.ITRT_CNTNT,
            period: r.PERIO,
          }));
          timetable.push(...weeklyData);
        }
      }
    }
  }
  return timetable;
};

export const refreshWeeklyTimetable = async () => {
  console.log(123);
  const weeklyTimetable = await fetchWeeklyTimetable();

  const today = new Date(TEMP_DATE);
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);

  await TimetableModel.deleteMany({
    date: {
      $gte: weekStart,
      $lte: weekEnd,
    },
  });

  await TimetableModel.insertMany(weeklyTimetable);
};
