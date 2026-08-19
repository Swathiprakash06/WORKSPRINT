export const MIN_HOURS_FOR_SALARY = 6;

export const countSundaysInMonth = (year, month) => {
  let sundays = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (new Date(year, month - 1, day).getDay() === 0) {
      sundays += 1;
    }
  }
  return sundays;
};

export const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

/** Working days = days in month − Sundays in that month */
export const getWorkingDaysInMonth = (year, month) => {
  return getDaysInMonth(year, month) - countSundaysInMonth(year, month);
};

export const calculatePerDaySalary = (monthlySalary, year, month) => {
  if (!monthlySalary || monthlySalary <= 0) return 0;
  const workingDays = getWorkingDaysInMonth(year, month);
  if (workingDays <= 0) return 0;
  return Math.round((monthlySalary / workingDays) * 100) / 100;
};

export const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;
