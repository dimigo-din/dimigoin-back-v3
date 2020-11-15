export const getOnlyDate = (date: Date) => new Date(
  date.getFullYear(),
  date.getMonth(),
  date.getDate(),
);

export const isValidDate = (date: Date) => !Number.isNaN(date.getTime());
