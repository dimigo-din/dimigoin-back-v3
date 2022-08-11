import moment from 'moment-timezone';
import {
  AfterschoolTimeValues,
  NightTimeValues,
  Time,
  Day,
  DayValues,
} from '../types';

const timezone = 'Asia/Seoul';
moment.tz.setDefault(timezone);

const format = 'YYYY-MM-DD';

export const getTodayDateString = () => moment().format(format);
export const getNowTimeString = () => moment().format('YYYY-MM-DD HH:mm');
export const getNowTime = () => parseInt(moment().format('HHmm'));
export const getExtraTime = (extraM: number, time: number) => parseInt(moment(`${time}`, 'HHmm').add(extraM, 'm').format('HHmm'));

export const getKoreanTodayFullString = () => moment().format(
  'YYYY년 MM월 DD일 HH시 mm분',
);

export const getDayCode = (date?: string) => {
  if (date) return moment(date).format('ddd').toLowerCase() as Day;
  return moment().format('ddd').toLowerCase() as Day;
};

export const getWeekStartString = (date?: string) => {
  if (date) return moment(date).startOf('isoWeek').format(format);
  return moment().startOf('isoWeek').format(format);
};

export const getWeekEndString = (date?: string) => {
  if (date) return moment(date).endOf('isoWeek').format(format);
  return moment().endOf('isoWeek').format(format);
};
export const getWeekdayEndString = () => moment().endOf('isoWeek').add(-2, 'd').format(format);
export const getConvAppliEndString = () => moment().startOf('isoWeek').add(1, 'd').format(format);

export const getMonthStartString = (date?: string) => {
  if (date) return moment(date).startOf('month').format(format);
  return moment().startOf('month').format(format);
};

export const getMonthEndString = (date?: string) => {
  if (date) return moment(date).endOf('month').format(format);
  return moment().endOf('month').format(format);
};

export const getDateFromDay = (weekStart: string, day: Day) => {
  weekStart = getWeekStartString(weekStart);
  const dayIndex = DayValues.findIndex((v) => v === day);
  const date = moment(weekStart).add(dayIndex, 'days');
  return date.format(format);
};

export const isValidDate = (string: string): Boolean =>
  moment(string, format, true).isValid();

export const getTomorrowDateString = (date?: string) => {
  if (date) return moment(date, format, true).clone().add(1, 'days').format(format);
  return moment().clone().add(1, 'days').format(format);
};

export const getMinutesValue = ({ hour, minute }: {
  hour: number, minute: number
}) => hour * 60 + minute;

// @Need-Refactor
export const getTime = (date: Date): Time | null => {
  const now = (
    new Date().getHours() * 100
    + new Date().getMinutes()
  );

  if (now >= 1705 && now <= 1750) return AfterschoolTimeValues[0];
  if (now >= 1755 && now <= 1835) return AfterschoolTimeValues[1];
  if (now >= 1950 && now <= 2110) return NightTimeValues[0];
  if (now >= 2130 && now <= 2250) return NightTimeValues[1];

  return null;
};

/**
 * @deprecated
 */
export const getOnlyDate = (date: Date): Date => new Date(
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
);

/**
 * @deprecated
 */
export const getTomorrow = (date: Date): Date => {
  date = new Date(date); // Clone date object
  return new Date(date.setDate(date.getDate() + 1));
};

/**
 * @deprecated
 */
export const getDayStart = (date: Date): Date => {
  date = new Date(date); // Clone date object
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * @deprecated
 */
export const getDayEnd = (date: Date): Date => {
  date = new Date(date); // Clone date object
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * @deprecated
 */
export const getWeekStart = (date: Date): Date => {
  date = new Date(date); // Clone date object
  date.setDate(date.getDate() - date.getDay());
  return getOnlyDate(date);
};

/**
 * @deprecated
 */
export const getWeekEnd = (date: Date): Date => {
  date = new Date(date); // Clone date object
  date.setDate(date.getDate() + (6 - date.getDay()));
  return getOnlyDate(date);
};
