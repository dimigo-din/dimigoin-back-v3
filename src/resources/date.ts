import {
  AfterschoolTimeValues,
  NightTimeValues,
  Time,
} from '../types';

import moment from 'moment-timezone';

const timezone = 'Asia/Seoul';
moment.tz.setDefault(timezone);

const format = 'YYYY-MM-DD';

// @Deprecated
export const getOnlyDate = (date: Date): Date => new Date(
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
);

export const getTodayDateString = () => moment().format(format);

export const getWeekStartString = (date?: string) => {
  if (date) return moment(date).startOf('week').format(format);
  return moment().startOf('week').format(format);
}

export const getWeekEndString = (date?: string) => {
  if (date) return moment(date).endOf('week').format(format);
  return moment().endOf('week').format(format);
}

export const isValidDate = (string: string): Boolean =>
  moment(string, format, true).isValid();

// @Deprecated
export const getWeekStart = (date: Date): Date => {
  date = new Date(date); // Clone date object
  date.setDate(date.getDate() - date.getDay());
  return getOnlyDate(date);
};

// @Deprecated
export const getWeekEnd = (date: Date): Date => {
  date = new Date(date); // Clone date object
  date.setDate(date.getDate() + (6 - date.getDay()));
  return getOnlyDate(date);
};

export const getTomorrowDateString = (date?: string) => {
  if (date) return moment(date, format, true).clone().add(1, 'days').format(format);
  return moment().clone().add(1, 'days').format(format);
}

// @Deprecated
export const getTomorrow = (date: Date): Date => {
  date = new Date(date); // Clone date object
  return new Date(date.setDate(date.getDate() + 1));
};

// @Deprecated
export const getDayStart = (date: Date): Date => {
  date = new Date(date); // Clone date object
  date.setHours(0, 0, 0, 0);
  return date;
};

// @Deprecated
export const getDayEnd = (date: Date): Date => {
  date = new Date(date); // Clone date object
  date.setHours(23, 59, 59, 999);
  return date;
};

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
