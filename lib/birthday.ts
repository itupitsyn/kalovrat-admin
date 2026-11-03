const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** «15.03» в «03-15», как дату хранит бот; null, если такого дня нет. */
export const parseBirthday = (text: string) => {
  const match = /^(\d{1,2})\.(\d{1,2})$/.exec(text.trim());
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const limit = DAYS_IN_MONTH[month - 1];
  if (limit === undefined || day < 1 || day > limit) {
    return null;
  }

  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/** «03-15» в «15.03». */
export const formatBirthday = (birthday: string | null | undefined) => {
  if (!birthday) {
    return '';
  }
  const [month, day] = birthday.split('-');

  return `${day}.${month}`;
};
