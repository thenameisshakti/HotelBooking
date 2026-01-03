export const getDatesInRange = (start, end) => {
  const dates = [];
  let current = new Date(start);
  const checkout = new Date(end);

  while (current < checkout) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};