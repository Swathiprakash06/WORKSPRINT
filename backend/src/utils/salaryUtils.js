const MIN_HOURS_FOR_SALARY = 6;

/**
 * Count Sundays in a calendar month (1-indexed month).
 */
const countSundaysInMonth = (year, month) => {
  let sundays = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (new Date(year, month - 1, day).getDay() === 0) {
      sundays += 1;
    }
  }
  return sundays;
};

/**
 * Number of calendar days in a month (month is 1-indexed).
 */
const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

/**
 * Working days = days in that month minus Sundays (all Sundays are holidays).
 * Formula: monthlySalary / (daysInMonth - sundays)
 */
const getWorkingDaysInMonth = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const sundays = countSundaysInMonth(year, month);
  return daysInMonth - sundays;
};

/**
 * Per-day salary for a given month, rounded to 2 decimals.
 */
const calculatePerDaySalary = (monthlySalary, year, month) => {
  if (!monthlySalary || monthlySalary <= 0) return 0;
  const workingDays = getWorkingDaysInMonth(year, month);
  if (workingDays <= 0) return 0;
  return Math.round((monthlySalary / workingDays) * 100) / 100;
};

const getMonthYearFromDate = (date) => {
  const d = new Date(date);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

module.exports = {
  MIN_HOURS_FOR_SALARY,
  countSundaysInMonth,
  getDaysInMonth,
  getWorkingDaysInMonth,
  calculatePerDaySalary,
  getMonthYearFromDate,
  formatCurrency,
};
