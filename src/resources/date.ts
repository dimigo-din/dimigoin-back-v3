export const getOnlyDate = (date: Date) => new Date(
  `${date.getFullYear()}-`
  + `${date.getMonth() + 1}-`
  + `${date.getDate()}`,
);

export const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

export const getWeekStart = (date: Date) => {
  date.setDate(date.getDate() - date.getDay());
  return date;
};

export const getWeekEnd = (date: Date) => {
  date.setDate(date.getDate() - date.getDay());
  return date;
};
