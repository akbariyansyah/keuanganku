const DAYS_IN_YEAR = 365;

function TodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

function daysBetween(from: Date, to: Date = new Date()): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

const startOfDayWIB = (date: Date) => {
  const d = new Date(
    date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
  );
  d.setHours(7, 0, 0, 0);
  return d;
};

const endOfDayWIB = (date: Date) => {
  const d = new Date(
    date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
  );
  d.setHours(23, 59, 59, 999);
  return d;
};

function nowInWIB() {
  const now = new Date();

  // get UTC time in ms
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);

  // add 7 hours for WIB
  const wib = new Date(utc + (7 * 60 * 60 * 1000));

  return wib;
}

const wibNow = nowInWIB();
const formatWIB = (date: Date) =>
  date
    .toLocaleString('sv-SE', {
      timeZone: 'Asia/Jakarta',
    })
    .replace(' ', 'T');

export { TodayDate, daysBetween, startOfDayWIB, endOfDayWIB, nowInWIB, formatWIB};
