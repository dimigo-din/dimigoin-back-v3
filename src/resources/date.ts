export const getOnlyDate = () => {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
};

export const isValidDate = (date: Date) => !Number.isNaN(date.getTime());
