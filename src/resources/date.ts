import {
  AfterschoolTimeValues,
  NightTimeValues,
  Time,
} from '../types';

export const getOnlyDate = (date: Date): Date => new Date(
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
);

export const isValidDate = (date: Date): Boolean => !Number.isNaN(date.getTime());

export const getWeekStart = (date: Date): Date => {
  date.setDate(date.getDate() - date.getDay());
  return date;
};

export const getWeekEnd = (date: Date): Date => {
  date.setDate(date.getDate() + (6 - date.getDay()));
  return date;
};

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
