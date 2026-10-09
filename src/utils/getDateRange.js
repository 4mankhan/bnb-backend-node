// dateUtils.js
export const getDateRange = (start, end) => {
  const dates = [];

  const current = new Date(start);
  const last = new Date(end);

  current.setUTCHours(0, 0, 0, 0);
  last.setUTCHours(0, 0, 0, 0);

  while (current < last) {
    dates.push(new Date(current));

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
};